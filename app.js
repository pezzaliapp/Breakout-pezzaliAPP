/* Breakout — pezzaliAPP (MIT) */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// World
const W = canvas.width, H = canvas.height;
const G = { paddleW: 88, paddleH: 14, ballR: 6, speed: 4.5, lives: 3 };

// Bricks
const COLS = 10, ROWS = 6, BW = 30, BH = 16, BGap = 4;
const BOffX = Math.floor((W - (COLS*BW + (COLS-1)*BGap))/2);
const BOffY = 80;

// Colors
const palette = ['#63e6ff','#4dabf7','#845ef7','#ffd43b','#ffa94d','#51cf66','#ff6b6b','#ced4da'];

// State
let score=0, lives=G.lives, level=1, paused=false, started=false;
let paddle = { x: W/2 - G.paddleW/2, y: H - 36, w:G.paddleW, h:G.paddleH };
let bricks=[], drops=[], balls=[];

// Init
function newBall(stuck=true){
  return { x: W/2, y: paddle.y - G.ballR - 1, r:G.ballR, vx:0, vy:0, stuck };
}
function buildLevel(n){
  bricks = [];
  const rows = ROWS + Math.min(4, n-1);
  for (let r=0; r<rows; r++){
    const row = [];
    for (let c=0; c<COLS; c++){
      let t = 1;
      if (r%3===0 && Math.random()<0.3) t = 2; // strong
      if (r%5===0 && Math.random()<0.1) t = 3; // steel
      if (Math.random()<0.12) t = 4;           // powerup
      row.push({x:BOffX + c*(BW+BGap), y:BOffY + r*(BH+BGap), type:t, hp:(t===2?2:1), alive:true});
    }
    bricks.push(row);
  }
}
function resetAll(){
  score=0; lives=G.lives; level=1; drops=[];
  buildLevel(level);
  balls=[ newBall(true) ];
  updateHUD();
  showOverlay('Breakout — pezzaliAPP','Premi <strong>Spazio</strong> o il bottone per lanciare.','Gioca');
}
buildLevel(level);
balls=[ newBall(true) ];

// Overlay
function hideOverlay(){ document.getElementById('overlay').classList.add('hidden'); }
function showOverlay(title,text,btn){ 
  document.getElementById('ovTitle').textContent=title;
  document.getElementById('ovText').innerHTML=text;
  document.getElementById('ovBtn').textContent=btn||'Gioca';
  document.getElementById('overlay').classList.remove('hidden');
}

// HUD
function updateHUD(){
  document.getElementById('score').textContent=score;
  document.getElementById('lives').textContent=lives;
  document.getElementById('level').textContent=level;
}

// Input
const keys = {};
document.addEventListener('keydown', e=>{
  if (e.code==='ArrowLeft') keys.left = true;
  if (e.code==='ArrowRight') keys.right = true;
  if (e.code==='Space'){ launch(); }
  if (e.code==='KeyP'){ togglePause(); }
  if (e.code==='KeyR'){ resetAll(); }
});
document.addEventListener('keyup', e=>{
  if (e.code==='ArrowLeft') keys.left = false;
  if (e.code==='ArrowRight') keys.right = false;
});
document.getElementById('btnLeft').onpointerdown=()=>keys.left=true;
document.getElementById('btnRight').onpointerdown=()=>keys.right=true;
document.getElementById('btnLaunch').onpointerdown=()=>launch();
document.getElementById('btnPause').onclick=()=>togglePause();
document.getElementById('btnRestart').onclick=()=>resetAll();
document.getElementById('ovBtn').onclick=()=>{ started=true; hideOverlay(); launch(); };

function launch(){
  balls.forEach(b=>{
    if (b.stuck){
      b.stuck=false;
      const angle = (-Math.PI/4) + Math.random()*Math.PI/2;
      b.vx = G.speed * Math.cos(angle);
      b.vy = -G.speed * Math.sin(angle);
    }
  });
}

function togglePause(){ paused=!paused; if(paused) showOverlay('Pausa','Premi <strong>P</strong> o il bottone per riprendere.','Riprendi'); else hideOverlay(); }

// Power-ups
function spawnDrop(x,y){
  const kinds = ['L','S','M','1'];
  const k = kinds[Math.floor(Math.random()*kinds.length)];
  drops.push({x,y,vy:2.2,kind:k, dead:false});
}

// Step
function step(dt){
  // paddle
  const pv = 6.2;
  if (keys.left) paddle.x -= pv;
  if (keys.right) paddle.x += pv;
  paddle.x = Math.max(8, Math.min(W - paddle.w - 8, paddle.x));

  // balls
  for (const b of [...balls]){
    if (b.stuck){ b.x = paddle.x + paddle.w/2; b.y = paddle.y - b.r - 1; continue; }
    b.x += b.vx; b.y += b.vy;

    // walls
    if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
    if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
    if (b.y < b.r + 48) { b.y = b.r + 48; b.vy = Math.abs(b.vy); }

    // paddle
    if (b.y > paddle.y - b.r && b.y < paddle.y + paddle.h && b.x > paddle.x && b.x < paddle.x + paddle.w){
      b.y = paddle.y - b.r - 1;
      const hit = (b.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
      const speed = Math.hypot(b.vx,b.vy) * 1.02;
      const maxAngle = Math.PI * 0.35;
      const ang = hit * maxAngle;
      b.vx = speed * Math.sin(ang);
      b.vy = -Math.abs(speed * Math.cos(ang));
    }

    // bricks
    for (const row of bricks){
      for (const br of row){
        if (!br.alive || br.type===3) continue;
        if (b.x + b.r > br.x && b.x - b.r < br.x + BW && b.y + b.r > br.y && b.y - b.r < br.y + BH){
          const prevX = b.x - b.vx, prevY = b.y - b.vy;
          const fromLeft = prevX <= br.x, fromRight = prevX >= br.x + BW;
          const fromTop = prevY <= br.y, fromBottom = prevY >= br.y + BH;
          if ((fromLeft && b.vx>0) || (fromRight && b.vx<0)) b.vx *= -1; else b.vy *= -1;
          br.hp -= 1;
          if (br.hp <= 0){ 
            br.alive=false; score += (br.type===2?60:50);
            if (br.type===4 && Math.random()<0.8) spawnDrop(br.x + BW/2, br.y + BH/2);
          } else score += 20;
          updateHUD();
        }
      }
    }

    // out
    if (b.y - b.r > H){
      const i = balls.indexOf(b);
      if (i>=0) balls.splice(i,1);
    }
  }

  // no balls -> life lost
  if (!balls.length){
    lives--;
    if (lives<=0){ showOverlay('Game Over', `Punteggio: <strong>${score}</strong>`, 'Rigioca'); resetAll(); return; }
    else { balls=[ newBall(true) ]; updateHUD(); }
  }

  // drops
  for (const d of drops){
    d.y += d.vy;
    if (d.y > H+20) d.dead=true;
    if (d.y > paddle.y && d.x > paddle.x && d.x < paddle.x + paddle.w){
      d.dead=true;
      if (d.kind==='L') paddle.w = Math.min((paddle.w||G.paddleW)+24, 140);
      if (d.kind==='S') balls.forEach(b=>{ b.vx*=0.85; b.vy*=0.85; });
      if (d.kind==='1') { lives++; updateHUD(); }
      if (d.kind==='M'){
        const b = balls[0];
        if (b && !b.stuck){ balls.push({x:b.x,y:b.y,r:b.r,vx:-b.vx,vy:b.vy,stuck:false}); }
      }
    }
  }
  drops = drops.filter(d=>!d.dead);

  // next level?
  const remaining = bricks.flat().filter(br=>br.alive && br.type!==3).length;
  if (remaining===0){
    level++; buildLevel(level);
    balls=[ newBall(true) ];
    updateHUD();
  }
}

// Render
function render(){
  ctx.fillStyle='#0e1429'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#151b31'; ctx.fillRect(0,0,W,48);
  ctx.fillStyle='#e9eef5'; ctx.font='14px system-ui';
  ctx.fillText(`Punti: ${score}`, 12, 30);
  ctx.fillText(`Vite: ${lives}`, 120, 30);
  ctx.fillText(`Livello: ${level}`, 200, 30);

  for (const row of bricks){
    for (const br of row){
      if (!br.alive) continue;
      const c = palette[(Math.floor((br.y - BOffY)/(BH+BGap)) % palette.length)];
      if (br.type===3){
        ctx.fillStyle='#98a6b3'; ctx.fillRect(br.x, br.y, BW, BH);
        ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(br.x, br.y, BW, 4);
      } else {
        ctx.fillStyle=c; ctx.fillRect(br.x, br.y, BW, BH);
        if (br.type===2){ ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.strokeRect(br.x+1, br.y+1, BW-2, BH-2); }
        ctx.fillStyle='rgba(255,255,255,.22)'; ctx.fillRect(br.x, br.y, BW, 4);
      }
    }
  }
  for (const d of drops){
    ctx.fillStyle = d.kind==='L' ? '#4dabf7' : d.kind==='S' ? '#ffd43b' : d.kind==='1' ? '#51cf66' : '#ff6b6b';
    ctx.beginPath(); ctx.arc(d.x, d.y, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#0f1320'; ctx.font='10px system-ui'; ctx.textAlign='center'; ctx.fillText(d.kind, d.x, d.y+3); ctx.textAlign='left';
  }
  ctx.fillStyle='#0b5fff'; ctx.fillRect(paddle.x, paddle.y, paddle.w, G.paddleH);
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(paddle.x, paddle.y, paddle.w, 4);
  for (const b of balls){
    ctx.fillStyle='#e9eef5'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(b.x-2, b.y-2, b.r/2, 0, Math.PI*2); ctx.fill();
  }
}

let last=0;
function loop(ts){
  if (!started || paused){ render(); requestAnimationFrame(loop); return; }
  const dt = Math.min(32, ts - (last||ts)); last = ts;
  step(dt); render(); requestAnimationFrame(loop);
}
updateHUD();
document.getElementById('ovBtn').textContent='Gioca';
document.getElementById('overlay').classList.remove('hidden');
requestAnimationFrame(loop);

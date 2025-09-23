/* Breakout — pezzaliAPP v9.0 (stable coords + visible paddle) */
const Mode = {
  load(){ return localStorage.getItem('breakout.mode') || 'auto'; },
  detect(){ const ua=navigator.userAgent.toLowerCase(); if(/iphone|ipad|ipod/.test(ua)) return 'iphone'; if(/android/.test(ua)) return 'samsung'; return 'laptop'; },
  apply(mode){
    document.body.classList.remove('iphone','samsung','laptop');
    const eff = (mode==='auto') ? Mode.detect() : mode;
    document.body.classList.add(eff);
    const sel=document.getElementById('modeSelect'); if (sel) sel.value=mode;
    localStorage.setItem('breakout.mode', mode);
    if (eff!=='laptop'){
      document.addEventListener('touchmove', e=>e.preventDefault(), {passive:false});
      document.addEventListener('gesturestart', e=>e.preventDefault());
      document.addEventListener('dblclick', e=>e.preventDefault(), {passive:false});
    }
  }
};
(function initMode(){
  const sel=document.getElementById('modeSelect');
  const mo=document.getElementById('modeOverlay');
  if (!localStorage.getItem('breakout.mode')) mo.classList.remove('hidden');
  document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{ Mode.apply(b.dataset.mode); mo.classList.add('hidden'); document.getElementById('overlay').classList.remove('hidden'); }));
  sel?.addEventListener('change', ()=>Mode.apply(sel.value));
  Mode.apply(Mode.load());
})();

// Drawer
const drawer=document.getElementById('drawer');
document.getElementById('drawerToggle')?.addEventListener('click', ()=>{
  const open=drawer.classList.toggle('open');
  document.getElementById('drawerToggle').setAttribute('aria-expanded', String(open));
});

// Canvas fixed 360x640 (DPR scaling)
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d',{alpha:false});
const VW=360, VH=640;
function setupCanvas(){
  const dpr=Math.max(1, Math.min(2, window.devicePixelRatio||1));
  canvas.width=VW*dpr; canvas.height=VH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
}
setupCanvas();
addEventListener('resize', setupCanvas);
addEventListener('orientationchange', ()=>setTimeout(setupCanvas,150));

function toVirtual(x,y){ const r=canvas.getBoundingClientRect(); return { vx:(x-r.left)*VW/r.width, vy:(y-r.top)*VH/r.height }; }

// Game
const CONFIG={ STEEL_HITS:3 };
const G={ paddleW:88, paddleH:14, ballR:6, speed:4.5, lives:3 };
const COLS=10, ROWS=6, BW=30, BH=16, BGap=4;
const BOffX=Math.floor((VW - (COLS*BW + (COLS-1)*BGap))/2);
const BOffY=80;
const palette=['#63e6ff','#4dabf7','#845ef7','#ffd43b','#ffa94d','#51cf66','#ff6b6b','#ced4da'];

let score=0, lives=G.lives, level=1, paused=false, started=false;
let paddle={ x:VW/2 - G.paddleW/2, y:VH - 48, w:G.paddleW, h:G.paddleH };
let bricks=[], drops=[], balls=[];

function clampPaddleY(){ const top=56, bottom=VH - G.paddleH - 6; paddle.y=Math.max(top, Math.min(bottom, paddle.y)); }
function newBall(stuck=true){ return { x:VW/2, y:paddle.y - G.ballR - 1, r:G.ballR, vx:0, vy:0, stuck }; }

function buildLevel(n){
  bricks=[]; const rows=ROWS + Math.min(4, n-1);
  for(let r=0;r<rows;r++){
    const row=[];
    for(let c=0;c<COLS;c++){
      let t=1;
      if (r%3===0 && Math.random()<0.3) t=2;
      if (r%5===0 && Math.random()<0.15) t=3;
      if (Math.random()<0.12) t=4;
      row.push({x:BOffX+c*(BW+BGap), y:BOffY+r*(BH+BGap), type:t, hp:(t===2?2:t===3?CONFIG.STEEL_HITS:1), alive:true});
    }
    bricks.push(row);
  }
}
function resetAll(){
  score=0; lives=G.lives; level=1; drops=[];
  buildLevel(level);
  paddle.y=VH-48; clampPaddleY();
  balls=[ newBall(true) ];
  updateHUD();
  showOverlay('Breakout — pezzaliAPP','Tocca o premi <strong>Spazio</strong> per iniziare.','Gioca');
}
buildLevel(level);
clampPaddleY();
balls=[ newBall(true) ];

// Overlay & HUD
function hideOverlay(){ document.getElementById('overlay').classList.add('hidden'); requestAnimationFrame(()=>canvas.focus()); }
function showOverlay(t,html,btn){ const ov=document.getElementById('overlay'); ov.querySelector('#ovTitle').textContent=t; ov.querySelector('#ovText').innerHTML=html; ov.querySelector('#ovBtn').textContent=btn||'Gioca'; ov.classList.remove('hidden'); }
function updateHUD(){ document.getElementById('score').textContent=score; document.getElementById('lives').textContent=lives; document.getElementById('level').textContent=level; document.getElementById('hPts').textContent=score; document.getElementById('hLiv').textContent='L'+level; document.getElementById('hVit').textContent='♥'+lives; }

// Input
document.addEventListener('touchmove', e=>e.preventDefault(), {passive:false});
document.addEventListener('gesturestart', e=>e.preventDefault());
document.addEventListener('dblclick', e=>e.preventDefault(), {passive:false});

const keys={left:false,right:false};
function isGameKey(c){ return ['ArrowLeft','ArrowRight','Space','KeyP','KeyR'].includes(c); }
function startGame(){ if(!started){ started=true; hideOverlay(); launch(); requestAnimationFrame(()=>canvas.focus()); } }

addEventListener('keydown', e=>{ if(!isGameKey(e.code)) return; e.preventDefault();
  if(e.code==='ArrowLeft') keys.left=true;
  if(e.code==='ArrowRight') keys.right=true;
  if(e.code==='Space') startGame();
  if(e.code==='KeyP') togglePause();
  if(e.code==='KeyR') resetAll();
},{passive:false});
addEventListener('keyup', e=>{ if(!isGameKey(e.code)) return; e.preventDefault();
  if(e.code==='ArrowLeft') keys.left=false;
  if(e.code==='ArrowRight') keys.right=false;
},{passive:false});

const btnLeft=document.getElementById('btnLeft');
const btnRight=document.getElementById('btnRight');
const btnLaunch=document.getElementById('btnLaunch');

function movePaddleToClient(clientX){ const {vx}=toVirtual(clientX,0); paddle.x=Math.max(8, Math.min(VW - paddle.w - 8, vx - paddle.w/2)); }
canvas.addEventListener('pointerdown', e=>{ startGame(); movePaddleToClient(e.clientX); e.preventDefault(); }, {passive:false});
canvas.addEventListener('pointermove', e=>{ movePaddleToClient(e.clientX); e.preventDefault(); }, {passive:false});

function hold(dir){ const iv=setInterval(()=>{ if(dir<0) keys.left=true; else keys.right=true; },16); return ()=>{clearInterval(iv); keys.left=false; keys.right=false;}; }
let stopL=null, stopR=null;
btnLeft.addEventListener('pointerdown', e=>{stopL=hold(-1); e.preventDefault();},{passive:false});
btnLeft.addEventListener('pointerup',   ()=>{if(stopL)stopL();});
btnRight.addEventListener('pointerdown',e=>{stopR=hold(+1); e.preventDefault();},{passive:false});
btnRight.addEventListener('pointerup',  ()=>{if(stopR)stopR();});
btnLaunch.addEventListener('click', startGame);
document.getElementById('ovBtn').addEventListener('click', startGame);
document.getElementById('overlay').addEventListener('pointerdown', e=>{ e.preventDefault(); startGame(); }, {passive:false});

// Mechanics
function launch(){ balls.forEach(b=>{ if(b.stuck){ b.stuck=false; const angle=(-Math.PI/4)+Math.random()*Math.PI/2; b.vx=G.speed*Math.cos(angle); b.vy=-G.speed*Math.sin(angle); } }); }
function togglePause(){ paused=!paused; if(paused) showOverlay('Pausa','Premi <strong>P</strong> o il bottone per riprendere.','Riprendi'); else hideOverlay(); }
function spawnDrop(x,y){ const kinds=['L','S','M','1']; const k=kinds[(Math.random()*kinds.length)|0]; drops.push({x,y,vy:2.2,kind:k,dead:false}); }

function step(dt){
  if (!started || paused){ render(); return; }
  const pv=6.2;
  if (keys.left) paddle.x -= pv;
  if (keys.right) paddle.x += pv;
  paddle.x=Math.max(8, Math.min(VW - paddle.w - 8, paddle.x));
  clampPaddleY();

  for (const b of [...balls]){
    if (b.stuck){ b.x=paddle.x + paddle.w/2; b.y=paddle.y - b.r - 1; continue; }
    b.x+=b.vx; b.y+=b.vy;

    if (b.x < b.r){ b.x=b.r; b.vx=Math.abs(b.vx); }
    if (b.x > VW - b.r){ b.x=VW - b.r; b.vx=-Math.abs(b.vx); }
    if (b.y < b.r + 48){ b.y=b.r + 48; b.vy=Math.abs(b.vy); }

    if (b.y > paddle.y - b.r && b.y < paddle.y + G.paddleH && b.x > paddle.x && b.x < paddle.x + paddle.w){
      b.y = paddle.y - b.r - 1;
      const hit=(b.x - (paddle.x + paddle.w/2))/(paddle.w/2);
      const speed=Math.hypot(b.vx,b.vy)*1.02;
      const maxAngle=Math.PI*0.35;
      const ang=hit*maxAngle;
      b.vx = speed*Math.sin(ang);
      b.vy = -Math.abs(speed*Math.cos(ang));
    }

    for (const row of bricks){
      for (const br of row){
        if (!br.alive) continue;
        if (b.x + b.r > br.x && b.x - b.r < br.x + BW && b.y + b.r > br.y && b.y - b.r < br.y + BH){
          const prevX=b.x - b.vx, prevY=b.y - b.vy;
          const fromLeft=prevX <= br.x, fromRight=prevX >= br.x + BW;
          const fromTop=prevY <= br.y, fromBottom=prevY >= br.y + BH;
          if ((fromLeft && b.vx>0) || (fromRight && b.vx<0)) b.vx*=-1; else b.vy*=-1;

          br.hp -= 1;
          if (br.hp <= 0){ br.alive=false; score += (br.type===2?60 : br.type===3?80 : 50); }
          else { score += 20; }
          updateHUD();
        }
      }
    }

    if (b.y - b.r > VH){
      const i=balls.indexOf(b);
      if (i>=0) balls.splice(i,1);
    }
  }

  if (!balls.length){
    lives--;
    if (lives<=0){ showOverlay('Game Over', `Punteggio: <strong>${score}</strong>`, 'Rigioca'); resetAll(); return; }
    else { balls=[ newBall(true) ]; updateHUD(); }
  }

  for (const d of drops){
    d.y += d.vy;
    if (d.y > VH+20) d.dead=true;
    if (d.y > paddle.y && d.x > paddle.x && d.x < paddle.x + paddle.w){
      d.dead=true;
      if (d.kind==='L') paddle.w = Math.min((paddle.w||G.paddleW)+24, 140);
      if (d.kind==='S') balls.forEach(b=>{ b.vx*=0.85; b.vy*=0.85; });
      if (d.kind==='1') { lives++; updateHUD(); }
      if (d.kind==='M'){ const b=balls[0]; if(b && !b.stuck){ balls.push({x:b.x,y:b.y,r:b.r,vx:-b.vx,vy:b.vy,stuck:false}); } }
    }
  }
  drops = drops.filter(d=>!d.dead);

  const remaining = bricks.flat().filter(br=>br.alive).length;
  if (remaining===0){
    level++; buildLevel(level);
    paddle.y=VH-48; clampPaddleY();
    balls=[ newBall(true) ];
    balls.forEach(b=>{
      const s=Math.hypot(b.vx||G.speed, b.vy||G.speed)*1.08;
      const ang=Math.atan2(b.vy||-G.speed, b.vx||G.speed);
      b.vx=s*Math.cos(ang); b.vy=s*Math.sin(ang);
    });
    updateHUD();
  }
}

function render(){
  clampPaddleY();
  ctx.fillStyle='#0e1429'; ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='#151b31'; ctx.fillRect(0,0,VW,48);
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
        ctx.fillStyle='rgba(255,255,255,.85)'; ctx.font='10px system-ui'; ctx.textAlign='center';
        ctx.fillText('🛡×'+br.hp, br.x + BW/2, br.y + BH - 4);
        ctx.textAlign='left';
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
function loop(ts){ const dt=Math.min(32, ts-(last||ts)); last=ts; step(dt); render(); requestAnimationFrame(loop); }
updateHUD();
document.getElementById('overlay').classList.remove('hidden');
requestAnimationFrame(loop);

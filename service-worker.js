// Breakout PWA — Service Worker
const CACHE = 'breakout-pezzaliapp-v9-4';
const ASSETS = ['./','./index.html','./style.css','./app.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./readme.html'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{
  if (e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
    const copy=res.clone(); if (new URL(e.request.url).origin===location.origin){ caches.open(CACHE).then(c=>c.put(e.request, copy)); }
    return res;
  }).catch(()=>caches.match('./index.html'))));
});

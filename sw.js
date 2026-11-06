/* বাইতুল জান্নাত জামে মসজিদ — Service Worker
   নতুন ভার্সন দিলে শুধু VERSION বদলান */
const VERSION='v1';
const CACHE='bjm-'+VERSION;
const CORE=['./','index.html','manifest.webmanifest','favicon.ico','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('bjm-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const sameOrigin=u.origin===location.origin;
  const font=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!sameOrigin&&!font)return;            // API (আবহাওয়া, নামাজের সময় ইত্যাদি) সরাসরি নেটওয়ার্কে যাবে
  if(r.mode==='navigate'){                  // পেজ: আগে নেটওয়ার্ক, না থাকলে ক্যাশ
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{   // বাকি ফাইল: ক্যাশ আগে, পেছনে আপডেট
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>hit);
    return hit||net;
  }));
});

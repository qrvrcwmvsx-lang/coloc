const CACHE='colloquium-offline-v1';
const BASE=new URL('./',self.location.href);
const ASSETS=['./','index.html','manifest.webmanifest','apple-touch-icon.png','icon.svg','icon-192.png','icon-512.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(path=>new Request(new URL(path,BASE),{cache:'reload'})));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('colloquium-offline-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
if(request.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);try{const response=await fetch(request,{signal:controller.signal});if(!response.ok)throw Error('Navigation failed');await cache.put(new URL('index.html',BASE),response.clone());return response}catch{const saved=await cache.match(new URL('index.html',BASE));return saved||Response.error()}finally{clearTimeout(timeout)}})());return}
if(ASSETS.some(path=>new URL(path,BASE).pathname===url.pathname))event.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(url.pathname);if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response})());
});

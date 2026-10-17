const CACHE='refiner75-cache-v3';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('refiner75-cache-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith((async()=>{
    const url=new URL(event.request.url);
    const isAppFile=url.origin===self.location.origin&&(url.pathname.endsWith('/index.html')||url.pathname.endsWith('/'));
    if(isAppFile){
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}
      }catch(error){}
    }
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const response=await fetch(event.request);
      if(response.ok&&url.origin===self.location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }catch(error){return caches.match('./index.html');}
  })());
});

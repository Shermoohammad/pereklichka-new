const CACHE_NAME = 'pereklichka-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;
      return fetch(event.request).then(function(response){
        // Cache a copy of same-origin GET requests for future offline use
        if(event.request.method === 'GET' && response && response.status === 200 && response.type === 'basic'){
          const respClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, respClone);
          });
        }
        return response;
      }).catch(function(){
        // Offline and not cached — fall back to the main page for navigations
        if(event.request.mode === 'navigate'){
          return caches.match('./index.html');
        }
      });
    })
  );
});

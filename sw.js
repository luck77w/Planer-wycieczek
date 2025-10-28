const CACHE_NAME = "planer-cache-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// instalacja i zapisanie plików w cache
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// obsługa fetch – najpierw z cache, potem sieć
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});


// --- Cache dla kafli map OpenStreetMap z limitem ---
const MAP_CACHE = 'map-cache-v2';
const MAP_CACHE_LIMIT = 200; // maksymalna liczba zapisanych kafli

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // reagujemy tylko na kafle OSM
  if (url.startsWith('https://tile.openstreetmap.org/')) {
    event.respondWith(
      caches.open(MAP_CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());

          // ogranicz rozmiar cache
          limitMapCache(cache);

          return response;
        } catch (err) {
          console.warn('Błąd pobierania kafla:', err);
          return cached || new Response('', {status: 503});
        }
      })
    );
  }
});

// usuwa najstarsze wpisy, gdy cache przekracza limit
async function limitMapCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAP_CACHE_LIMIT) {
    const removeCount = keys.length - MAP_CACHE_LIMIT;
    for (let i = 0; i < removeCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

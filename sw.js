const CACHE_NAME = "planer-cache-v1";
const ASSETS = [
  "./planer4.html",
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

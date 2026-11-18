const CACHE_NAME = 'mecanica-reis-static-v1';
const STATIC_PATHS = new Set(['/','/manifest.webmanifest','/logo-mecanica-reis.jpeg','/icon-192.svg','/icon-512.svg']);

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))).then(() => self.clients.claim())),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const isStaticAsset = STATIC_PATHS.has(url.pathname) || url.pathname.startsWith('/assets/');
  if (!isStaticAsset) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      return response;
    })),
  );
});

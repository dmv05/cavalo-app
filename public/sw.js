// Service Worker Cavalo PWA
const CACHE_NAME = 'cavalo-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch : network-first pour les pages, cache-first pour les assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Network-first pour les API et les pages HTML
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Cache-first pour le reste (images, css, js)
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

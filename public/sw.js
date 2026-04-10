// cataloglidl.ro Service Worker — offline cache for visited pages
const CACHE_NAME = 'cataloglidl-v1';
const OFFLINE_URL = '/';

const CORE_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {
        // Ignore individual failures
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and non-http(s) schemes
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Skip AdSense, analytics, external ads
  if (url.hostname.includes('googlesyndication') ||
      url.hostname.includes('doubleclick') ||
      url.hostname.includes('google-analytics')) return;

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response before caching
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, fall back to homepage
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

const CACHE_NAME = 'findmypeople-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell, network for everything else (e.g. the
// Claude API call) so AI-generated messages always try the network first.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShellRequest = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace('./', '/')));

  if (isShellRequest) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // Non-shell requests (API calls) fall through to normal network behavior.
});

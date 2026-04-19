/* =======================================================
   OneProtocol Web - Service Worker
   Bump CACHE_V on every deploy to invalidate cache
   v10 - 2026-04-19
======================================================= */

const CACHE_V = 'op-web-v51'; // increment on each deploy

const PRECACHE = [
  '/',
  '/index.html',
  '/register.html',
  '/css/style.css?v=20260419b',
  '/css/register.css?v=20260419b',
  '/icons/logo-full.webp?v=20260419b',
  '/icons/logo-icon-rounded-sm.webp',
  '/icons/logo-icon-rounded.webp',
  '/icons/apple-touch-icon.png?v=20260419b',
];

// Install: pre-cache shell assets
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_V)
      .then(function (cache) { return cache.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

// Activate: wipe old cache versions
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_V; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

// Fetch strategy
self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = new URL(req.url);

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  // Skip Supabase / external API calls
  if (url.hostname.includes('supabase') || url.hostname.includes('resend')) return;

  var ext = url.pathname.split('.').pop().toLowerCase();
  var isHTML = req.headers.get('Accept') && req.headers.get('Accept').includes('text/html');
  var isAsset = ['css', 'js'].indexOf(ext) !== -1;
  var isStatic = ['webp', 'png', 'jpg', 'jpeg', 'svg', 'ico', 'woff2', 'woff'].indexOf(ext) !== -1;

  if (isHTML || isAsset) {
    // HTML + CSS/JS: network-first
    e.respondWith(
      fetch(req)
        .then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE_V).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || (isHTML ? caches.match('/index.html') : null);
          });
        })
    );
  } else if (isStatic) {
    // Images: stale-while-revalidate
    e.respondWith(
      caches.open(CACHE_V).then(function (cache) {
        return cache.match(req).then(function (cached) {
          var networkFetch = fetch(req).then(function (res) {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(function () { return cached; });
          return cached || networkFetch;
        });
      })
    );
  }
  // Everything else: let browser handle normally
});

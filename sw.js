// Service Worker WARFIT
// Strategie usate:
//  - navigation (HTML)            : network-first → cache → fallback index.html
//  - asset statici stessa origine : cache-first con revalidate in background
//  - OpenFoodFacts API            : stale-while-revalidate (offline dopo 1a query)
//  - altre cross-origin           : network → cache fallback

const CACHE_VERSION = 'warfit-v6';
const STATIC_CACHE  = CACHE_VERSION + '-static';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';
const API_CACHE     = CACHE_VERSION + '-api';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/theme.css',
  './css/layout.css',
  './css/components.css',
  './js/app.js',
  './js/storage.js',
  './js/state.js',
  './js/utils.js',
  './js/views/home.js',
  './js/views/schede.js',
  './js/views/workout.js',
  './js/views/storico.js',
  './js/views/food.js',
  './js/views/settings.js',
  './js/data/warfit.js',
  './js/data/berserker.js',
  './js/data/exercises.js',
  './assets/icons/icon.svg'
];

// install: precache resiliente (un fallimento non blocca il resto)
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await Promise.all(ASSETS.map(async url => {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (err) { console.warn('[sw] precache skip', url); }
    }));
    await self.skipWaiting();
  })());
});

// activate: pulizia cache vecchie + navigation preload
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const keep = new Set([STATIC_CACHE, RUNTIME_CACHE, API_CACHE]);
    await Promise.all(keys.map(k => keep.has(k) ? null : caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(networkFirstNav(e));
    return;
  }
  if (url.hostname.includes('openfoodfacts.org')) {
    e.respondWith(staleWhileRevalidate(req, API_CACHE));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(RUNTIME_CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});

async function networkFirstNav(event) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      cache.put('./index.html', preload.clone()).catch(() => {});
      return preload;
    }
    const res = await fetch(event.request);
    cache.put('./index.html', res.clone()).catch(() => {});
    return res;
  } catch {
    return (await cache.match(event.request))
        || (await cache.match('./index.html'))
        || (await cache.match('./'))
        || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok && res.type !== 'opaque') cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);
  if (cached) { fetchPromise.catch(() => {}); return cached; }
  const fresh = await fetchPromise;
  return fresh || Response.error();
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);
  return cached || (await fetchPromise) || new Response(
    JSON.stringify({ status: 0, status_verbose: 'offline' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

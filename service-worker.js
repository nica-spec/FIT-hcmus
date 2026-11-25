/* FIT@HCMUS offline app shell (100% local assets, zero external CDN dependencies).
 * All libraries (Chart.js, SheetJS, html2pdf.js, Font Awesome, Montserrat) are bundled locally in ./vendor/.
 * Academic records stay in the browser's localStorage; no grade data is sent externally.
 */
const OFFLINE_VERSION = 'fit-hcmus-offline-20261125-review-v4';
const SHELL_CACHE = OFFLINE_VERSION + '-shell';
const RUNTIME_CACHE = OFFLINE_VERSION + '-runtime';
const APP_SHELL = [
  './', './index.html', './register.html', './dashboard.html',
  './program.html', './grades.html', './goals.html',
  './graduation.html', './settings.html', './module-politics.html',
  './module-skills.html', './module-math.html', './module-it.html',
  './module-language.html', './module-foundation.html',
  './module-major.html', './module-graduation.html',
  './style.css', './script.js', './auth-guard.js',
  './course-requirements.js', './hoc_truoc_K2025.json',
  './favicon.svg',
  './vendor/bg-auth.jpg',
  './vendor/chart.umd.min.js',
  './vendor/xlsx.full.min.js',
  './vendor/html2pdf.bundle.min.js',
  './vendor/fa/css/all.min.css',
  './vendor/fa/webfonts/fa-brands-400.woff2',
  './vendor/fa/webfonts/fa-brands-400.ttf',
  './vendor/fa/webfonts/fa-regular-400.woff2',
  './vendor/fa/webfonts/fa-regular-400.ttf',
  './vendor/fa/webfonts/fa-solid-900.woff2',
  './vendor/fa/webfonts/fa-solid-900.ttf',
  './vendor/fa/webfonts/fa-v4compatibility.woff2',
  './vendor/fa/webfonts/fa-v4compatibility.ttf',
  './vendor/fonts/montserrat.css',
  './vendor/fonts/JTUSjIg1_i6t8kCHKm459W1hyzbi.woff2',
  './vendor/fonts/JTUSjIg1_i6t8kCHKm459Wdhyzbi.woff2',
  './vendor/fonts/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2',
  './vendor/fonts/JTUSjIg1_i6t8kCHKm459WRhyzbi.woff2',
  './vendor/fonts/JTUSjIg1_i6t8kCHKm459WZhyzbi.woff2'
];
const ONLINE_LIBRARIES = [];

async function cacheResource(cache, url) {
  try {
    const request = new Request(url, { mode: 'same-origin' });
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
      return true;
    }
  } catch (error) {
    console.warn('[offline] Could not cache:', url, error);
  }
  return false;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const existing = await caches.keys();
    await Promise.all(existing.filter(name => name.startsWith('fit-hcmus-offline-') &&
      name !== SHELL_CACHE && name !== RUNTIME_CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, navigation = false) {
  const runtime = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await runtime.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (navigation) {
      const index = await caches.match('./index.html');
      if (index) return index;
    }
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !/^https?:$/.test(new URL(request.url).protocol)) return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, request.mode === 'navigate'));
  }
});

self.addEventListener('message', event => {
  if (!['OFFLINE_STATUS', 'PREPARE_OFFLINE'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    if (event.data.type === 'PREPARE_OFFLINE') {
      for (const path of APP_SHELL) {
        if (!(await cache.match(path))) await cacheResource(cache, path);
      }
    }
    const missing = [];
    for (const url of APP_SHELL) {
      if (!(await cache.match(url))) missing.push(url);
    }
    event.source?.postMessage({
      type: 'OFFLINE_STATUS',
      ready: missing.length === 0,
      missing,
      unavailableLibraries: []
    });
  })());
});

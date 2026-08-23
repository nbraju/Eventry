// Eventry AI Cloud — minimal service worker
// Caches the app shell so the PWA is installable and opens instantly offline.
// Live vendor data still requires a network connection (Google Sheets backend).
const CACHE_NAME = 'eventry-ai-cloud-v1';
const APP_SHELL = ['./index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Network-first for the Google Apps Script backend (always want fresh vendor data)
  if (req.url.includes('script.google.com')) return;
  event.respondWith(
    fetch(req).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, resClone)).catch(() => {});
      return res;
    }).catch(() => caches.match(req))
  );
});

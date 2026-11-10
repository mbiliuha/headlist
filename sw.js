// sw.js — щоб аппу відкривався без інтернету: оболонка сторінки береться з кешу телефону, а свіжа версія підтягується у фоні.
var C = 'hl-shell-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  // дані (Apps Script) не кешуємо — для них є власний кеш у застосунку
  if (u.hostname === 'script.google.com' || u.hostname.endsWith('googleusercontent.com')) return;
  if (!(u.origin === location.origin || u.hostname === 'telegram.org')) return;
  e.respondWith(caches.open(C).then(function (c) {
    return c.match(r, { ignoreSearch: u.origin === location.origin }).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});

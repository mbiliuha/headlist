// sw.js — щоб застосунок відкривався без інтернету.
// Сторінка: спершу мережа (щоб після оновлення одразу була свіжа версія), якщо за 3 с не відповіла — з кешу телефону.
// Решта файлів (скрипт Telegram): з кешу, оновлюється у фоні.
var C = 'hl-shell-v2';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  // дані (Apps Script) не кешуємо — для них є власний кеш у застосунку
  if (u.hostname === 'script.google.com' || u.hostname.endsWith('googleusercontent.com')) return;
  var own = u.origin === location.origin;
  if (!(own || u.hostname === 'telegram.org')) return;
  e.respondWith(caches.open(C).then(function (c) {
    // ключ кешу сторінки — без параметрів (у них персональний ключ, його не зберігаємо)
    var key = own ? new Request(u.origin + u.pathname) : r;
    var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(key, res.clone()); return res; });
    return c.match(key).then(function (hit) {
      if (!hit) return net;
      if (r.mode !== 'navigate') { net.catch(function () {}); return hit; }
      return Promise.race([net, new Promise(function (ok) { setTimeout(function () { ok(hit); }, 3000); })]).catch(function () { return hit; });
    });
  }));
});

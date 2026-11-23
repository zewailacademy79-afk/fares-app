/* Fares Print service worker: network-first, so a new deploy shows up on the same link.
   Supabase / any other origin is never touched or cached here. */
const CACHE = 'fp-shell-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(r, { cache: 'no-cache' });
      if (res.ok) { const c = await caches.open(CACHE); c.put(r, res.clone()); }
      return res;
    } catch (err) {
      const hit = (await caches.match(r)) || (await caches.match('./'));
      if (hit) return hit;
      throw err;
    }
  })());
});

// AutoCSS App Shell service worker — the ONE canonical copy, edited here.
// A service worker must be served from the site's OWN origin, and cross-origin
// importScripts of a shared worker is not reliably supported, so each consuming
// site ships this file VERBATIM as its /sw.js (copied like the skeleton, not
// fetched like the pool). Keep this the single source; propagate by copy.
//
// Strategy:
//   - cdn static assets (JS/CSS/fonts/pool.html)  -> stale-while-revalidate
//       (instant from cache; a cdn edit propagates on the next load)
//   - navigations (the site's index.html) + data  -> network-first, cache fallback
//       (fresh when online; the site still renders offline)
//
// Bump VERSION to force a clean cache rebuild on release.
const VERSION = "autocss-v1";
const CDN = "https://autocss-com.github.io/cdn/";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // Best-effort precache of the boot essentials; never fail install on a miss.
    await Promise.allSettled([
      cache.add(new Request(CDN + "assets/js/app.js", { cache: "reload" })),
      cache.add(new Request(CDN + "assets/pool.html", { cache: "reload" })),
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isCdn = req.url.startsWith(CDN);
  const isData = url.pathname.includes("/assets/data/");
  const isNav = req.mode === "navigate";

  if (isCdn && !isData) {
    event.respondWith(staleWhileRevalidate(req));
  } else if (isNav || isData) {
    event.respondWith(networkFirst(req));
  }
  // Anything else falls through to the browser's default handling.
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(req);
  const fresh = fetch(req)
    // Cross-origin <link>/font requests are no-cors -> opaque (res.ok === false).
    // Cache those too, or CSS/fonts would never be available offline.
    .then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return cached || (await fresh) || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw new Error("offline and not cached: " + req.url);
  }
}

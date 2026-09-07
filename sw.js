// AutoCSS App Shell service worker — the ONE canonical copy, edited here.
// A service worker must be served from the site's OWN origin, so each consuming
// site ships this file VERBATIM as its /sw.js (copied like the skeleton, not
// fetched like the pool). Register it with a RELATIVE path — `./sw.js` — so on a
// GitHub Pages PROJECT site (served under /<repo>/) it resolves to /<repo>/sw.js
// and scopes to that subpath. A root-absolute "/sw.js" would 404 at a subpath.
//
// Strategy — NETWORK-FIRST (always fresh while online):
//   Every GET goes to the network first, so a freshly-deployed file always wins
//   while online — edits show on the next load, with no stale-while-revalidate.
//   Each OK (or opaque cross-origin) response is copied into the cache purely as
//   an OFFLINE FALLBACK, so the site still renders with no network.
//   (A production build may reintroduce stale-while-revalidate for cdn statics
//   for instant first paint — tracked in the cdn handoff.)
//
// Bump VERSION to evict a previously-cached build on the next activate.
const VERSION = "autocss-v2";
const CDN = "https://autocss-com.github.io/cdn/";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Drop every older cache (e.g. the v1 stale-while-revalidate store).
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

  // cdn assets, the site's own navigations, and data: all network-first, so a
  // fresh deploy always wins while online; the cache is only the offline fallback.
  if (isCdn || isNav || isData) {
    event.respondWith(networkFirst(req));
  }
  // Anything else falls through to the browser's default handling.
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    // Cache OK responses and opaque cross-origin ones (no-cors cdn CSS/fonts),
    // so the site still renders offline — but only ever SERVED when the network
    // is unreachable (above we returned the fresh network response).
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw new Error("offline and not cached: " + req.url);
  }
}

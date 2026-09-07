# international.dance

The AutoCSS content site for international.dance. It carries **only its own
content**; the entire front-end (HTML shell, CSS, JS, fonts, and the component
pool) is served from the shared
[`Autocss-com/cdn`](https://github.com/Autocss-com/cdn) front-end.

Live: https://autocss-com.github.io/id/

## What lives here
- `index.html` — thin shell; links every shared asset from the CDN by absolute
  URL, ships an empty `<template>` (the component pool is pulled from the CDN),
  and registers the service worker
- `assets/data/*.json` — the content (`shell`, `home`, `about`, `classes`, `policy`, `contact`)
- `sw.js` — the CDN's App Shell service worker, verbatim (a service worker must be
  same-origin), so the site loads instantly and works offline from cache

## How it works
No framework, no build, no third-party services. The CDN front-end fetches this
repo's `assets/data/*.json` relative to the page, so the shared UI renders this
site's own data. Change the JSON → change the site.

Front-end: https://github.com/Autocss-com/cdn

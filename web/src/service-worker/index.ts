// The service worker caches the shell only: the built code, the static files and the prerendered pages, none of which
// holds owner data. It never caches /api/ or anything else, so private responses are never kept here (MP-134).
import { self as sw } from '$app/service-worker';
import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';
import { isShell, shellPaths } from '#lib/sw-policy.ts';

const CACHE = `mp-shell-${version}`;
const SHELL = shellPaths([...immutable, ...assets, ...prerendered].map((f) => f.path));

sw.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([...SHELL])));
});

sw.addEventListener('activate', (event) => {
  // A new shell version replaces the old cache on the next load.
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== sw.location.origin || !isShell(url.pathname, SHELL)) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(event.request);
        if (fresh.ok) await cache.put(event.request, fresh.clone());
        return fresh;
      } catch {
        const kept = await cache.match(event.request);
        if (kept) return kept;
        throw new Error('offline and not cached');
      }
    })
  );
});

const CACHE_NAME = 'sultan-academy-v1';

self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Network-first: Yeniləmələr dərhal görünsün, offline olanda keşdən açsın
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET' || e.request.url.includes('supabase.co')) return;
    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});

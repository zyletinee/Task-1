// creating cache
const CACHE_NAME = 'cache_v1';

// defining all files which need to be cached
const CACHE_URLS = [
    '/',
    '/Home.html',
    '/GamePage.html',
    '/search.html',
    '/SignUp.html',
    '/Login.html',
    '/webstyle.css',
    '/Assets/grn_logo.png'
];

// install event; caching all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching assets...');
            return cache.addAll(CACHE_URLS);
        })
    );
});

// activate event; clear old cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// fetch event; check if it's available, if not then serve offline cached asset
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).catch(() => {
                return caches.match('/offline.html');
            });
        })
    );
});

const CACHE_NAME = 'jorn-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other important assets here like main JS/CSS bundles if not automatically handled by your build process
  // '/static/js/bundle.js', // Example
  // '/static/css/main.css', // Example
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching', event.request.url);
  if (event.request.method !== 'GET') {
    // For non-GET requests, use the network directly.
    // This is important for things like API calls (POST, PUT, DELETE etc.)
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // console.log('Service Worker: Found in cache', event.request.url);
          return response; // Serve from cache
        }
        // console.log('Service Worker: Not in cache, fetching from network', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Optional: Cache new requests dynamically if needed
            // Be careful with caching everything, especially API responses that change frequently
            // if (networkResponse && networkResponse.status === 200) {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            // }
            return networkResponse;
          }
        );
      })
      .catch(error => {
        console.error('Service Worker: Fetch error', error);
        // Optionally, you could return a fallback offline page here
        // return caches.match('/offline.html');
      })
  );
}); 
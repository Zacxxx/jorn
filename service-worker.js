const CACHE_NAME = 'jorn-cache-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.css',
  '/index.tsx',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets here
];

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first'
};

// Helper function to determine cache strategy
function getCacheStrategy(url) {
  if (STATIC_ASSETS.includes(url)) {
    return CACHE_STRATEGIES.STATIC;
  }
  if (url.includes('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  return CACHE_STRATEGIES.DYNAMIC;
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Service Worker: Dynamic cache ready');
        return cache;
      })
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle different caching strategies
  const strategy = getCacheStrategy(url.pathname);
  
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      event.respondWith(cacheFirst(event.request, STATIC_CACHE));
      break;
    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(event.request));
      break;
    default:
      event.respondWith(cacheFirst(event.request, DYNAMIC_CACHE));
  }
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('Cache First Strategy failed:', error);
    // Return a fallback response if available
    return caches.match('/offline.html');
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('Network First Strategy failed:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return a fallback response if available
    return caches.match('/offline.html');
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Jorn', options)
  );
}); 
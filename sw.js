const CACHE_NAME = 'pmg-hub-v77.2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Client postMessage notification handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'showNotification') {
    const title = event.data.title || "⚡ PMG Performance Hub";
    const options = {
      body: event.data.body || "New update in PMG Sales Hub.",
      icon: "./favicon.ico",
      badge: "./favicon.ico",
      vibrate: [200, 100, 200],
      data: { url: event.data.url || "./index.html" }
    };
    self.registration.showNotification(title, options);
  }
});

// Native Web Push Event Handler
self.addEventListener('push', (event) => {
  let title = "⚡ PMG Performance Hub";
  let body = "New update in PMG Sales Hub.";
  let url = "./index.html";

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.message || data.body || body;
      url = data.url || data.click || url;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: "./favicon.ico",
    badge: "./favicon.ico",
    vibrate: [200, 100, 200],
    data: { url: url }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('pmgareasales') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/* BloodConnect BD — পুশ নোটিফিকেশন সার্ভিস ওয়ার্কার */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(d.title || 'জরুরি রক্তের অনুরোধ', {
      body: d.body || 'আপনার কাছাকাছি কারো রক্ত দরকার।',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: d.tag || 'blood-request',
      lang: 'bn',
      renotify: true,
      requireInteraction: true,
      data: { url: d.url || '/requests' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/requests';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          if ('navigate' in c) c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
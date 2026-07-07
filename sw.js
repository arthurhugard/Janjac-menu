// Service Worker — gère la réception des notifications push
// même quand l'onglet n'est pas au premier plan ou l'écran verrouillé.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Notification', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '🔔 Appel serveur';
  const options = {
    body: data.body || "Un client demande un serveur.",
    tag: 'server-call',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/#gestion' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

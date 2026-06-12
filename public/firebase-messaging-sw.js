// Loman Service Worker - Push Notification Handler
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCr7BbmYQ42EtxkTJ9zP0iGtRsvxOVlIo8",
  authDomain: "loman-app.firebaseapp.com",
  projectId: "loman-app",
  storageBucket: "loman-app.appspot.com",
  messagingSenderId: "642027415706",
  appId: "1:642027415706:web:0c0f7f49133183ab405723"
});

// Handle skip waiting
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate immediately
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Handle background messages
var messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);
  var notification = payload.notification || {};
  var title = notification.title || 'Loman';
  var body = notification.body || 'Ada update baru!';
  var icon = notification.icon || '/icon-192.png';

  return self.registration.showNotification(title, {
    body: body,
    icon: icon,
    badge: '/icon-192.png',
    tag: 'loman-' + Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {}
  });
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});

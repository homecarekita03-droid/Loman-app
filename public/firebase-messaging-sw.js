// Loman Service Worker - Push Notification
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

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Handle push notification LANGSUNG dari push event (paling reliable)
self.addEventListener('push', function(event) {
  if (!event.data) return;

  var data = event.data.json();
  var notification = data.notification || {};
  var title = notification.title || 'Loman';
  var body = notification.body || 'Ada pesanan baru!';
  var icon = notification.icon || '/icon-192.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      badge: '/icon-192.png',
      tag: 'loman-' + Date.now(),
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      data: data.data || {},
      actions: [
        { action: 'open', title: 'Buka Loman' }
      ]
    })
  );
});

// Juga handle via Firebase messaging (backup)
var messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  var notification = payload.notification || {};
  self.registration.showNotification(notification.title || 'Loman', {
    body: notification.body || 'Ada pesanan baru!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'loman-' + Date.now(),
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300],
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Buka Loman' }
    ]
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

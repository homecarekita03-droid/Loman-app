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

const messaging = firebase.messaging();

// Handle background messages (saat app tidak dibuka)
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message:', payload);
  var notification = payload.notification || {};
  self.registration.showNotification(notification.title || 'Loman', {
    body: notification.body || 'Ada update baru!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: notification.tag || 'loman-notif',
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
      // Jika sudah ada window yang terbuka, fokus ke situ
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('loman') && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika tidak ada, buka baru
      return clients.openWindow('/');
    })
  );
});

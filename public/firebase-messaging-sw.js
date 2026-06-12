// Loman Service Worker
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

// Push notification handler
self.addEventListener('push', function(event) {
  if (!event.data) return;
  try {
    var data = event.data.json();
    var title = 'Pesanan Baru!';
    var body = 'Ada pesanan baru di Loman';
    var icon = 'https://loman.store/icon-192.png';

    if (data.notification) {
      title = data.notification.title || title;
      body = data.notification.body || body;
    }
    if (data.webpush && data.webpush.notification) {
      if (data.webpush.notification.icon) icon = data.webpush.notification.icon;
    }

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: icon,
        badge: icon,
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true,
        tag: 'loman-' + Date.now(),
      })
    );
  } catch (e) {
    // Fallback jika parsing gagal
    event.waitUntil(
      self.registration.showNotification('Pesanan Baru!', {
        body: 'Ada pesanan baru di Loman',
        icon: 'https://loman.store/icon-192.png',
        vibrate: [300, 100, 300, 100, 300],
      })
    );
  }
});

// Firebase background messaging (backup)
try {
  var messaging = firebase.messaging();
  messaging.onBackgroundMessage(function(payload) {
    var n = payload.notification || {};
    self.registration.showNotification(n.title || 'Pesanan Baru!', {
      body: n.body || 'Ada pesanan baru',
      icon: 'https://loman.store/icon-192.png',
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
    });
  });
} catch (e) {}

// Klik notifikasi → buka Loman
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://loman.store'));
});

// Skip waiting
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

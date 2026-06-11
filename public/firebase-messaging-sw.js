importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');
firebase.initializeApp({
  apiKey: "ISI_API_KEY",
  projectId: "loman-app",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((p) => {
  self.registration.showNotification(p.notification.title, { body: p.notification.body, icon: '/icon-192.png' });
});

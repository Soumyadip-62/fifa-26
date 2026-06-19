importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB_kZoRVRZlpIOV7KYBY-_U16HMD-Bh_e4",
  projectId: "fifa-notification-service",
  messagingSenderId: "774951739922",
  appId: "1:774951739922:web:3927a19897a9e9135baecb",
  authDomain: "fifa-notification-service.firebaseapp.com",
  storageBucket: "fifa-notification-service.firebasestorage.app",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

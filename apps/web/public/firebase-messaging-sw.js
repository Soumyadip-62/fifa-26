/* global firebase */
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
  if (payload.notification) {
    return;
  }

  const title = payload.data?.title || "FIFA 2026";
  const body = payload.data?.body;

  self.registration.showNotification(title, {
    body,
    tag: payload.data?.matchId
      ? `${payload.data.matchId}:${payload.data.event}`
      : undefined,
    data: { url: payload.data?.url },
  });
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  const target = event.notification.data?.url;
  if (!target) return;
  const url = new URL(target, self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.notification.close();
  event.waitUntil(self.clients.openWindow(url.href));
});

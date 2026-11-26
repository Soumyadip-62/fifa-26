import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import {
  getNotificationAccess,
  notificationAccessMessage,
} from "@/lib/notification-permission";
import {
  getNotificationWorker,
  withNotificationTimeout,
} from "./notificationWorker";

let registrationPromise: Promise<string> | null = null;

// Permission is requested by the tap handler before loading this module.
// Firebase handles token caching; always recheck permission before reuse.
export function registerPush(): Promise<string> {
  const access = getNotificationAccess();
  if (access !== "granted")
    return Promise.reject(new Error(notificationAccessMessage(access)));
  if (registrationPromise) return registrationPromise;
  registrationPromise = (async () => {
    const messaging = await getFirebaseMessaging();
    if (!messaging) throw new Error(notificationAccessMessage("unsupported"));
    const serviceWorkerRegistration = await getNotificationWorker();
    const token = await withNotificationTimeout(
      getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration,
      }),
      "Notification activation timed out. Check your connection and try again.",
    );
    if (!token)
      throw new Error(
        "Notifications could not be activated. Please try again.",
      );
    if (Notification.permission !== "granted")
      throw new Error(notificationAccessMessage(Notification.permission));
    return token;
  })().finally(() => {
    registrationPromise = null;
  });
  return registrationPromise;
}

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";

let isRegistering = false;
let cachedToken: string | null = null;

// notificationService.ts
export async function registerPush() {
  if (isRegistering) return null;
  if (cachedToken) return cachedToken;

  isRegistering = true;
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) throw new Error("Messaging unsupported");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      isRegistering = false;
      return null;
    }

    // 🟢 REMOVED THE UNREGISTER LOOP FROM HERE

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    console.log("Successfully got token:", token);
    cachedToken = token;
    return token;
  } catch (err) {
    console.error("Error inside getToken:", err);
    throw err;
  } finally {
    isRegistering = false;
  }
}

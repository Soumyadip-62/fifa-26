// This module stays lightweight: a tap must reach requestPermission before any
// dynamic imports, SDK initialization, or other asynchronous work.
export type NotificationAccess =
  | NotificationPermission
  | "unsupported"
  | "insecure"
  | "unconfigured";

export function getNotificationAccess(): NotificationAccess {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "insecure";
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  )
    return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return "unconfigured";
  return Notification.permission;
}

export function notificationAccessMessage(access: NotificationAccess): string {
  switch (access) {
    case "denied":
      return "Notifications are blocked. Open this site's browser settings, allow notifications, then return here and try again.";
    case "unsupported":
      return "This browser does not support push notifications. On iPhone or iPad, add the site to your Home Screen and open it there. On Android, try Chrome.";
    case "insecure":
      return "Open this site over HTTPS to enable notifications.";
    case "unconfigured":
      return "Notifications are temporarily unavailable. Please try again later.";
    case "default":
      return "Choose Enable browser notifications, then Allow in your browser's permission prompt.";
    default:
      return "Browser permission is allowed. Enable notifications to activate alerts for this device.";
  }
}

export async function requestNotificationPermission(): Promise<void> {
  const access = getNotificationAccess();
  if (access !== "default" && access !== "granted")
    throw new Error(notificationAccessMessage(access));
  const permission =
    access === "granted" ? access : await Notification.requestPermission();
  if (permission === "denied")
    throw new Error(notificationAccessMessage("denied"));
  if (permission !== "granted")
    throw new Error(
      "Permission was not granted. Tap Enable browser notifications to try again; your favourites are still saved.",
    );
}

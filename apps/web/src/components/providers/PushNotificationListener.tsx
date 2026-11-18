"use client";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { usePreferences } from "@/lib/preferences";
export function PushNotificationListener() {
  const p = usePreferences();
  useEffect(() => {
    if (
      !p.notifications.enabled ||
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    )
      return;
    let unsubscribe: (() => void) | undefined,
      cancelled = false;
    void getFirebaseMessaging().then((m) => {
      if (!m || cancelled) return;
      unsubscribe = onMessage(m, (payload) => {
        void navigator.serviceWorker.ready
          .then((registration) =>
            registration.showNotification(
              payload.notification?.title ?? "Football update",
              {
                body: payload.notification?.body,
                tag: payload.data?.matchId
                  ? `${payload.data.matchId}:${payload.data.event}`
                  : undefined,
                data: { url: payload.data?.url },
              },
            ),
          )
          .catch(() => {});
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [p.notifications.enabled]);
  return null;
}

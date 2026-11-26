"use client";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase";
import { usePreferences } from "@/lib/preferences";
import { useNotificationAccess } from "@/lib/use-notification-access";
import { getNotificationWorker } from "@/lib/utils/notificationWorker";
export function PushNotificationListener() {
  const p = usePreferences();
  const access = useNotificationAccess();
  useEffect(() => {
    if (!p.notifications.enabled || access !== "granted") return;
    let unsubscribe: (() => void) | undefined,
      cancelled = false;
    void Promise.all([getFirebaseMessaging(), getNotificationWorker()])
      .then(([m, registration]) => {
        if (!m || cancelled) return;
        unsubscribe = onMessage(m, (payload) => {
          if (Notification.permission !== "granted") return;
          void registration
            .showNotification(
              payload.notification?.title ??
                payload.data?.title ??
                "Football update",
              {
                body: payload.notification?.body ?? payload.data?.body,
                tag: payload.data?.matchId
                  ? `${payload.data.matchId}:${payload.data.event}`
                  : undefined,
                data: { url: payload.data?.url },
              },
            )
            .catch(() => {});
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [p.notifications.enabled, access]);
  return null;
}

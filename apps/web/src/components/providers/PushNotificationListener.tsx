"use client";

import { useEffect } from "react";
import { registerPush } from "@/lib/utils/notificationService";
import { getMessaging, onMessage } from "firebase/messaging";
import { apiUrl } from "@/lib/api/config";

export function PushNotificationListener() {
  useEffect(() => {
    registerPush()
      .then((t) =>
        fetch(`${apiUrl("notification/subscribe")}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fcmToken: t }),
        }),
      )
      .catch(console.error);
    if (!getMessaging) return;
    const unsubscribe = onMessage(getMessaging(), (payload) => {
      new Notification(payload.notification?.title ?? "Notification", {
        body: payload.notification?.body,
      });
    });

    return unsubscribe;
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { registerPush } from "@/lib/utils/notificationService";
import { getMessaging, onMessage } from "firebase/messaging";
import { subscribeNotifications } from "@/lib/api/notification";

export function PushNotificationListener() {
  useEffect(() => {
    let token: string | null = null;

    registerPush()
      .then((t) => {
        token = t;
        return t ? subscribeNotifications(t) : null;
      })
      .catch(console.error);

    const handlePreferenceChange = () => {
      if (!token) return;
      subscribeNotifications(token).catch(console.error);
    };

    window.addEventListener(
      "notification-preferences:change",
      handlePreferenceChange,
    );

    if (!getMessaging) return;
    const unsubscribe = onMessage(getMessaging(), (payload) => {
      new Notification(payload.notification?.title ?? "Notification", {
        body: payload.notification?.body,
      });
    });

    return () => {
      window.removeEventListener(
        "notification-preferences:change",
        handlePreferenceChange,
      );
      unsubscribe();
    };
  }, []);

  return null;
}

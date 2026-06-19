"use client";

import { useEffect } from "react";
import { registerPush } from "@/lib/utils/notificationService";
import { getMessaging, onMessage } from "firebase/messaging";

export function PushNotificationListener() {
  useEffect(() => {
    registerPush().then().catch(console.error);
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

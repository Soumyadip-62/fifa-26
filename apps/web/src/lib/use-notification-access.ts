"use client";

import { useSyncExternalStore } from "react";
import {
  getNotificationAccess,
  type NotificationAccess,
} from "./notification-permission";

export function refreshNotificationAccess() {
  window.dispatchEvent(new Event("football:notification-access"));
}

function subscribe(listener: () => void) {
  let disposed = false;
  let permission: PermissionStatus | undefined;
  const visible = () => {
    if (document.visibilityState === "visible") listener();
  };
  window.addEventListener("focus", listener);
  window.addEventListener("football:notification-access", listener);
  document.addEventListener("visibilitychange", visible);
  if (navigator.permissions?.query) {
    void navigator.permissions
      .query({ name: "notifications" })
      .then((status) => {
        if (disposed) return;
        permission = status;
        status.addEventListener("change", listener);
        listener();
      })
      .catch(() => {});
  }
  return () => {
    disposed = true;
    permission?.removeEventListener("change", listener);
    window.removeEventListener("focus", listener);
    window.removeEventListener("football:notification-access", listener);
    document.removeEventListener("visibilitychange", visible);
  };
}

const serverSnapshot = (): NotificationAccess => "unsupported";
export function useNotificationAccess() {
  return useSyncExternalStore(subscribe, getNotificationAccess, serverSnapshot);
}

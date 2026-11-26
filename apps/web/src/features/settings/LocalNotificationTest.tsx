"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotificationWorker } from "@/lib/utils/notificationWorker";

export function LocalNotificationTest() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function sendTest() {
    setBusy(true);
    setStatus("");
    try {
      if (
        !window.isSecureContext ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator)
      ) {
        throw new Error(
          "Use a browser with notification support on localhost or HTTPS.",
        );
      }
      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      if (permission !== "granted") {
        throw new Error(
          "Allow notifications in this site's browser settings, then try again.",
        );
      }

      const registration = await getNotificationWorker();

      await registration.showNotification("NinetyPlus - Test", {
        body: "This is a dummy notification from your local NinetyPlus app.",
        tag: "football-local-test",
        data: {
          url: new URL("/settings/notifications", window.location.origin).href,
        },
      });
      setStatus(
        "Dummy notification sent to this browser. Check your device's notifications.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "The dummy notification could not be sent.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid gap-3 border-t border-border pt-5">
      <h3 className="text-sm font-semibold">Local notification test</h3>
      <p className="text-xs leading-5 text-muted-foreground">
        Show a sample notification on this device. This checks browser display;
        Firebase push delivery is tested separately in Operations.
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-fit"
        disabled={busy}
        onClick={() => void sendTest()}
      >
        <BellRing className="size-4" aria-hidden="true" />
        {busy ? "Sending notification..." : "Send dummy notification"}
      </Button>
      <p
        role="status"
        aria-live="polite"
        className="text-xs leading-5 text-muted-foreground"
      >
        {status}
      </p>
    </div>
  );
}

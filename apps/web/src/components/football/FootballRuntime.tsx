"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  migratePreferences,
  syncDevice,
  usePreferences,
} from "@/lib/preferences";
export function FootballRuntime() {
  const router = useRouter(),
    preferences = usePreferences();
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(refresh, 15 * 60 * 1000);
    window.addEventListener("online", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("online", refresh);
    };
  }, [router]);
  useEffect(() => {
    void migratePreferences().catch((e) =>
      setError(e instanceof Error ? e.message : "Preference migration failed."),
    );
  }, []);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      void syncDevice(preferences)
        .then(() => {
          if (!cancelled) setError("");
        })
        .catch((e) => {
          if (!cancelled)
            setError(
              e instanceof Error
                ? e.message
                : "Notification settings could not be synced.",
            );
        });
    }, 750);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [preferences]);
  return error ? (
    <p
      role="status"
      className="border-b border-red-500/20 px-4 py-2 text-xs text-red-500"
    >
      {error}
    </p>
  ) : null;
}

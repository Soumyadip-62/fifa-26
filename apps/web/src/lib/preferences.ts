"use client";
import { useSyncExternalStore } from "react";
import type { DevicePreferences } from "@/types/football";
import { apiUrl } from "./api/config";

const key = "football:preferences:v1";
export const defaultPreferences: DevicePreferences = {
  version: 1,
  teamIds: [],
  playerIds: [],
  competitionIds: [],
  matchIds: [],
  reminders: {},
  notifications: {
    enabled: false,
    kickoff30: true,
    kickoff10: false,
    finalScore: true,
  },
};
let cached: DevicePreferences = defaultPreferences,
  rawCache: string | null = null;
export function readPreferences(): DevicePreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = localStorage.getItem(key);
    if (raw === rawCache) return cached;
    rawCache = raw;
    const p = raw ? JSON.parse(raw) : null;
    cached =
      p?.version === 1
        ? {
            ...defaultPreferences,
            ...p,
            notifications: {
              ...defaultPreferences.notifications,
              ...p.notifications,
            },
          }
        : defaultPreferences;
    return cached;
  } catch {
    return cached;
  }
}
export function savePreferences(p: DevicePreferences) {
  try {
    localStorage.setItem(key, JSON.stringify(p));
  } catch {
    throw new Error(
      "Device storage is unavailable. Preferences could not be saved.",
    );
  }
  window.dispatchEvent(new Event("football:preferences"));
}
export function updatePreferences(
  update: (p: DevicePreferences) => DevicePreferences,
) {
  savePreferences(update(readPreferences()));
}
function subscribe(fn: () => void) {
  window.addEventListener("storage", fn);
  window.addEventListener("football:preferences", fn);
  return () => {
    window.removeEventListener("storage", fn);
    window.removeEventListener("football:preferences", fn);
  };
}
export const usePreferences = () =>
  useSyncExternalStore(subscribe, readPreferences, () => defaultPreferences);
export function toggleFavourite(
  kind: "teamIds" | "playerIds" | "competitionIds" | "matchIds",
  id: string,
) {
  updatePreferences((p) => ({
    ...p,
    [kind]: p[kind].includes(id)
      ? p[kind].filter((v) => v !== id)
      : [...p[kind], id],
  }));
}
export function toggleReminder(id: string) {
  updatePreferences((p) => {
    const reminders = { ...p.reminders };
    if (reminders[id]?.length) delete reminders[id];
    else reminders[id] = [30];
    return { ...p, reminders };
  });
}

type Registration = { id: string; secret: string; token: string | null };
const deviceKey = "football:device:v1";
export async function syncDevice(
  preferences = readPreferences(),
  token?: string,
) {
  const raw = localStorage.getItem(deviceKey),
    saved: Registration | null = raw ? JSON.parse(raw) : null;
  const pushToken = token ?? saved?.token ?? null;
  const customizedNotifications = Object.keys(
    defaultPreferences.notifications,
  ).some(
    (key) =>
      preferences.notifications[
        key as keyof DevicePreferences["notifications"]
      ] !==
      defaultPreferences.notifications[
        key as keyof DevicePreferences["notifications"]
      ],
  );
  const hasPreferencesToSave =
    preferences.teamIds.length > 0 ||
    preferences.playerIds.length > 0 ||
    preferences.competitionIds.length > 0 ||
    preferences.matchIds.length > 0 ||
    Object.keys(preferences.reminders).length > 0 ||
    preferences.notifications.enabled ||
    customizedNotifications;
  if (!saved && !pushToken && !hasPreferencesToSave) return;
  const response = await fetch(
    apiUrl(saved ? `/football/devices/${saved.id}` : "/football/devices"),
    {
      method: saved ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(saved ? { "x-device-secret": saved.secret } : {}),
      },
      body: JSON.stringify({ preferences, token: pushToken }),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok)
    throw new Error("Notification settings could not be saved to the backend.");
  const registration = await response.json();
  localStorage.setItem(
    deviceKey,
    JSON.stringify(
      saved
        ? { ...saved, token: pushToken }
        : { ...registration, token: pushToken },
    ),
  );
}
export async function enablePush() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)
    throw new Error(
      "Push activation needs NEXT_PUBLIC_FIREBASE_VAPID_KEY in the frontend environment.",
    );
  const { registerPush } = await import("./utils/notificationService");
  const token = await registerPush();
  if (!token)
    throw new Error(
      "Browser notifications are not permitted. Local favourites are still saved.",
    );
  const next = {
    ...readPreferences(),
    notifications: { ...readPreferences().notifications, enabled: true },
  };
  await syncDevice(next, token);
  savePreferences(next);
}
export async function migratePreferences() {
  if (localStorage.getItem(key)) return;
  const legacy = localStorage.getItem("fifa26:notification-preferences");
  if (!legacy) return;
  let p: {
    favoriteTeams?: string[];
    kickoff30?: boolean;
    kickoff10?: boolean;
    finalScore?: boolean;
  };
  try {
    p = JSON.parse(legacy);
  } catch {
    return;
  }
  const teamIds: string[] = [];
  for (const alias of (p.favoriteTeams ?? []).slice(0, 100)) {
    const response = await fetch(
      apiUrl(`/football/teams/${encodeURIComponent(alias)}`),
    );
    if (response.ok) {
      const result = await response.json();
      if (result.item?.id) teamIds.push(result.item.id);
    } else if (response.status !== 404)
      throw new Error("Preference migration is waiting for backend access.");
  }
  // Do not overwrite choices changed while the alias lookups were running.
  if (!localStorage.getItem(key))
    savePreferences({
      ...defaultPreferences,
      teamIds: [...new Set(teamIds)],
      notifications: {
        ...defaultPreferences.notifications,
        kickoff30: p.kickoff30 ?? true,
        kickoff10: p.kickoff10 ?? false,
        finalScore: p.finalScore ?? true,
      },
    });
}

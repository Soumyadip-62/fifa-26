import { apiUrl } from "./config";

export type NotificationPreferences = {
  favoriteTeams: string[];
  kickoff30: boolean;
  kickoff10: boolean;
  finalScore: boolean;
  qualification: boolean;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  favoriteTeams: [],
  kickoff30: true,
  kickoff10: false,
  finalScore: false,
  qualification: true,
};

const STORAGE_KEY = "fifa26:notification-preferences";

export function readNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return defaultNotificationPreferences;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultNotificationPreferences;

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;

    return {
      ...defaultNotificationPreferences,
      ...parsed,
      favoriteTeams: Array.isArray(parsed.favoriteTeams)
        ? parsed.favoriteTeams.filter(Boolean)
        : [],
    };
  } catch {
    return defaultNotificationPreferences;
  }
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent("notification-preferences:change"));
}

export async function subscribeNotifications(
  fcmToken: string,
  preferences = readNotificationPreferences(),
) {
  const response = await fetch(apiUrl("notification/subscribe"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fcmToken, preferences }),
  });

  if (!response.ok) {
    throw new Error("Failed to save notification preferences");
  }

  return response.json();
}

export async function sendDeviceTestNotifications(
  fcmToken: string,
  type?: "kickoff30" | "kickoff10" | "finalScore" | "qualification",
  adminSecret = "",
) {
  const response = await fetch(apiUrl("notification/test/device"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminSecret ? { "x-admin-secret": adminSecret } : {}),
    },
    body: JSON.stringify({ token: fcmToken, type }),
  });

  if (!response.ok) {
    throw new Error("Failed to send device test notifications");
  }

  return response.json() as Promise<{
    sent: number;
    total: number;
    token: boolean;
    types: string[];
  }>;
}

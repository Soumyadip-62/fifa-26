import { apiUrl } from "./config";
import { readPreferences, updatePreferences, syncDevice } from "../preferences";

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

export function readNotificationPreferences(): NotificationPreferences {
  const p = readPreferences();
  return {
    favoriteTeams: p.teamIds,
    kickoff30: p.notifications.kickoff30,
    kickoff10: p.notifications.kickoff10,
    finalScore: p.notifications.finalScore,
    qualification: false,
  };
}
export function saveNotificationPreferences(
  preferences: NotificationPreferences,
) {
  updatePreferences((p) => ({
    ...p,
    teamIds: preferences.favoriteTeams,
    notifications: {
      ...p.notifications,
      kickoff30: preferences.kickoff30,
      kickoff10: preferences.kickoff10,
      finalScore: preferences.finalScore,
    },
  }));
}
export async function subscribeNotifications(token: string) {
  return syncDevice(readPreferences(), token);
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

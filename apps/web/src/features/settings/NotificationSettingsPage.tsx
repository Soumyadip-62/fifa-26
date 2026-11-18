"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellRing, ArrowUpRight } from "lucide-react";
import {
  enablePush,
  updatePreferences,
  usePreferences,
  syncDevice,
} from "@/lib/preferences";
import { SectionHeader } from "@/components/common/SectionHeader";
import { TeamMark } from "@/components/football/TeamMark";
import { Button } from "@/components/ui/button";
import type { FootballTeam } from "@/types/football";
import { LocalNotificationTest } from "./LocalNotificationTest";

export function NotificationSettingsPage({ teams }: { teams: FootballTeam[] }) {
  const p = usePreferences();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const followed = teams.filter((team) => p.teamIds.includes(team.id));
  const enable = async () => {
    setBusy(true);
    try {
      await enablePush();
      setStatus("Browser notifications enabled for this device.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Notifications could not be enabled.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Never miss your matchday"
        title="Notification settings"
        description="Kickoff reminders and full-time scores only for games involving your favourite teams."
      />
      <div className="settings-grid">
        <section className="companion-panel notification-panel">
          <div className="notification-status">
            <span
              className={
                p.notifications.enabled
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            >
              <BellRing aria-hidden="true" />
            </span>
            <div>
              <h2>
                {p.notifications.enabled
                  ? "Alerts are enabled"
                  : "Alerts are off"}
              </h2>
              <p>Get the moments that matter, straight to this device.</p>
            </div>
          </div>
          <Button
            disabled={busy}
            variant={p.notifications.enabled ? "outline" : "default"}
            className="mb-6 w-fit"
            onClick={() => {
              if (p.notifications.enabled) {
                updatePreferences((value) => ({
                  ...value,
                  notifications: { ...value.notifications, enabled: false },
                }));
                void syncDevice().catch((error) => setStatus(error.message));
              } else void enable();
            }}
          >
            {busy
              ? "Enabling notifications…"
              : p.notifications.enabled
                ? "Disable browser notifications"
                : "Enable browser notifications"}
          </Button>
          {status && (
            <p
              role="status"
              className="mb-4 rounded-md border border-border bg-secondary p-3 text-xs"
            >
              {status}
            </p>
          )}
          <div className="notification-options">
            {(
              [
                [
                  "kickoff30",
                  "30 minutes before kickoff",
                  "A little time to get ready for the game.",
                ],
                [
                  "kickoff10",
                  "10 minutes before kickoff",
                  "Your final reminder before the first whistle.",
                ],
                [
                  "finalScore",
                  "Full-time scores",
                  "The final result when the match is done.",
                ],
              ] as const
            ).map(([key, label, description]) => (
              <label key={key}>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
                <input
                  type="checkbox"
                  className="notification-switch"
                  aria-label={label}
                  checked={p.notifications[key]}
                  onChange={() =>
                    updatePreferences((value) => ({
                      ...value,
                      notifications: {
                        ...value.notifications,
                        [key]: !value.notifications[key],
                      },
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
            Preferences are saved in this browser and synced for delivery.
            Alerts require browser permission and an active notification
            service. Other event alerts are unavailable with current data
            coverage.
          </p>
          {process.env.NODE_ENV === "development" && <LocalNotificationTest />}
        </section>
        <aside className="companion-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2">
              <Bell className="size-4 text-primary" aria-hidden="true" />
              Following
            </h2>
            <Link
              href="/favourites"
              className="inline-flex items-center gap-1 text-xs text-primary"
            >
              Manage
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          {followed.length ? (
            <div className="grid gap-3">
              {followed.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <TeamMark team={team} size="sm" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs leading-6 text-muted-foreground">
              No teams selected yet. Follow a team from your favourites to make
              these alerts your own.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

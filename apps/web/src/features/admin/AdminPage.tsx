"use client";

import { useState } from "react";
import { FootballOperations } from "./FootballOperations";
import { BellRing, KeyRound, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/common/SectionHeader";
import { sendDeviceTestNotifications } from "@/lib/api/notification";
import { registerPush } from "@/lib/utils/notificationService";
import { requestNotificationPermission } from "@/lib/notification-permission";

type ActionState = {
  loading: boolean;
  message: string;
  error: string;
};

const initialState: ActionState = {
  loading: false,
  message: "",
  error: "",
};

const testTypes = [
  { key: undefined, label: "All Types" },
  { key: "kickoff30", label: "30 Min" },
  { key: "kickoff10", label: "10 Min" },
  { key: "finalScore", label: "Final Score" },
  { key: "qualification", label: "Qualification" },
] as const;

const ADMIN_SECRET_STORAGE_KEY = "fifa26:admin-secret";

export function AdminPage() {
  const [notificationTest, setNotificationTest] =
    useState<ActionState>(initialState);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [adminSecret, setAdminSecret] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(ADMIN_SECRET_STORAGE_KEY) ?? ""),
  );

  const updateAdminSecret = (value: string) => {
    setAdminSecret(value);
    window.localStorage.setItem(ADMIN_SECRET_STORAGE_KEY, value);
  };

  const sendNotificationTest = async (
    type?: (typeof testTypes)[number]["key"],
  ) => {
    setNotificationTest({ loading: true, message: "", error: "" });

    try {
      await requestNotificationPermission();
      const token = await registerPush();

      if (!token) {
        throw new Error("Notification permission or FCM token not available.");
      }

      setDeviceToken(token);
      const result = await sendDeviceTestNotifications(
        token,
        type,
        adminSecret,
      );
      setNotificationTest({
        loading: false,
        message: `Sent ${result.sent}/${result.total} test notification(s) to this device only.`,
        error: "",
      });
    } catch (error) {
      setNotificationTest({
        loading: false,
        message: "",
        error:
          error instanceof Error
            ? error.message
            : "Failed to send notification test",
      });
    }
  };

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Admin"
        title="Operations"
        description="Sync tournament data and test this device's notifications."
      />

      <Card className="rounded-lg border border-border bg-card shadow-none backdrop-blur-md dark:border-border dark:bg-card">
        <CardContent className="grid gap-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
              <KeyRound size={18} />
            </span>
            <div>
              <h2 className="font-heading text-lg font-black text-foreground dark:text-white">
                Admin Secret
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Required for all administrative operations.
              </p>
            </div>
          </div>
          <Input
            className="h-11 rounded-full text-xs"
            onChange={(event) => updateAdminSecret(event.target.value)}
            placeholder="Enter admin secret"
            type="password"
            value={adminSecret}
          />
        </CardContent>
      </Card>

      <FootballOperations secret={adminSecret} />
      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-lg border border-border bg-card shadow-none backdrop-blur-md dark:border-border dark:bg-card">
          <CardContent className="grid gap-5 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Smartphone size={18} />
              </span>
              <div>
                <h2 className="font-heading text-lg font-black text-foreground dark:text-white">
                  Device Notifications
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Sends only to this browser device token.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {testTypes.map((item) => (
                <Button
                  key={item.label}
                  className="h-10 rounded-full text-xs font-bold"
                  disabled={notificationTest.loading}
                  onClick={() => sendNotificationTest(item.key)}
                  variant={item.key ? "outline" : "default"}
                >
                  <BellRing size={14} />
                  {item.label}
                </Button>
              ))}
            </div>

            {deviceToken ? (
              <p className="truncate rounded-2xl border border-border bg-secondary px-3 py-2 text-[10px] font-semibold text-muted-foreground dark:border-border dark:bg-secondary">
                Device token: {deviceToken}
              </p>
            ) : null}
            <StatusLine state={notificationTest} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatusLine({ state }: { state: ActionState }) {
  if (state.loading) {
    return <p className="text-xs font-bold text-primary">Working...</p>;
  }

  if (state.error) {
    return <p className="text-xs font-bold text-destructive">{state.error}</p>;
  }

  if (state.message) {
    return (
      <p className="text-xs font-bold text-emerald-500">{state.message}</p>
    );
  }

  return null;
}

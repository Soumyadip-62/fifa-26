"use client";

import { useState } from "react";
import { BellRing, Database, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/common/SectionHeader";
import { syncMatchesDb, syncQualifiedTeamsDb } from "@/lib/api/admin";
import { sendDeviceTestNotifications } from "@/lib/api/notification";
import { registerPush } from "@/lib/utils/notificationService";

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

export function AdminPage() {
  const [matchesSync, setMatchesSync] = useState<ActionState>(initialState);
  const [qualifiedSync, setQualifiedSync] = useState<ActionState>(initialState);
  const [notificationTest, setNotificationTest] =
    useState<ActionState>(initialState);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  const runAction = async (
    setState: (state: ActionState) => void,
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    setState({ loading: true, message: "", error: "" });

    try {
      await action();
      setState({ loading: false, message: successMessage, error: "" });
    } catch (error) {
      setState({
        loading: false,
        message: "",
        error: error instanceof Error ? error.message : "Action failed",
      });
    }
  };

  const syncEverything = async () => {
    await runAction(
      setMatchesSync,
      syncMatchesDb,
      "Matches DB sync completed.",
    );
    await runAction(
      setQualifiedSync,
      syncQualifiedTeamsDb,
      "Qualified teams sync completed.",
    );
  };

  const sendNotificationTest = async (type?: (typeof testTypes)[number]["key"]) => {
    setNotificationTest({ loading: true, message: "", error: "" });

    try {
      const token = deviceToken ?? (await registerPush());

      if (!token) {
        throw new Error("Notification permission or FCM token not available.");
      }

      setDeviceToken(token);
      const result = await sendDeviceTestNotifications(token, type);
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
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <SectionHeader
        eyebrow="Admin"
        title="Operations"
        description="Sync tournament data and test this device's notifications."
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[28px] border border-black/5 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/50">
          <CardContent className="grid gap-5 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Database size={18} />
              </span>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-950 dark:text-white">
                  Database Sync
                </h2>
                <p className="text-xs font-semibold text-zinc-500">
                  Refresh matches and qualification data.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                className="h-11 rounded-full text-xs font-bold"
                disabled={matchesSync.loading}
                onClick={() =>
                  runAction(
                    setMatchesSync,
                    syncMatchesDb,
                    "Matches DB sync completed.",
                  )
                }
              >
                <RefreshCw size={15} />
                Matches
              </Button>
              <Button
                className="h-11 rounded-full text-xs font-bold"
                disabled={qualifiedSync.loading}
                onClick={() =>
                  runAction(
                    setQualifiedSync,
                    syncQualifiedTeamsDb,
                    "Qualified teams sync completed.",
                  )
                }
              >
                <RefreshCw size={15} />
                Qualified
              </Button>
              <Button
                className="h-11 rounded-full text-xs font-bold"
                disabled={matchesSync.loading || qualifiedSync.loading}
                variant="outline"
                onClick={syncEverything}
              >
                <Database size={15} />
                All
              </Button>
            </div>

            <StatusLine state={matchesSync} />
            <StatusLine state={qualifiedSync} />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border border-black/5 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/50">
          <CardContent className="grid gap-5 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Smartphone size={18} />
              </span>
              <div>
                <h2 className="font-heading text-lg font-black text-zinc-950 dark:text-white">
                  Device Notifications
                </h2>
                <p className="text-xs font-semibold text-zinc-500">
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
              <p className="truncate rounded-2xl border border-black/5 bg-zinc-100/60 px-3 py-2 text-[10px] font-semibold text-zinc-500 dark:border-white/10 dark:bg-zinc-800/30">
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
    return <p className="text-xs font-bold text-emerald-500">{state.message}</p>;
  }

  return null;
}

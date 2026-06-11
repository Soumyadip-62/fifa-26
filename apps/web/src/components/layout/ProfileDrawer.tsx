"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  Heart,
  Moon,
  Sun,
  Camera,
  Settings,
  X,
  Check,
  Monitor,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ProfileDrawer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [name, setName] = React.useState("Soumyadip");
  const [isEditingName, setIsEditingName] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-emerald-500/20 hover:border-emerald-500 transition-all duration-300"
        >
          <div className="flex h-full w-full items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            <User size={20} />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto h-[100vh]">
        <DrawerHeader className="relative pb-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-black font-heading text-neutral-950 dark:text-white">
              My Profile
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
              >
                <X size={18} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="size-24 rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl">
                  <div className="h-full w-full rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                    <User size={48} className="text-neutral-400" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-neutral-950 text-white border-2 border-white dark:border-neutral-900 shadow-lg hover:scale-110 transition-transform">
                  <Camera size={14} />
                </button>
              </div>

              <div className="text-center w-full max-w-[240px]">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 text-center font-bold"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setIsEditingName(false)
                      }
                      onBlur={() => setIsEditingName(false)}
                    />
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsEditingName(false)}
                    >
                      <Check size={14} />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="group flex items-center justify-center gap-2 mx-auto"
                  >
                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {name}
                    </h3>
                    <Settings
                      size={14}
                      className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                )}
                <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1 font-semibold">
                  FIFA Fan since 2024
                </p>
              </div>
            </div>
          </section>

          {/* Favourite Teams */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Heart size={16} fill="currentColor" />
                Favourite Teams
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] uppercase font-bold"
              >
                Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Argentina", "France", "India"].map((team) => (
                <div
                  key={team}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-sm font-semibold flex items-center gap-2"
                >
                  <div className="size-2 rounded-full bg-emerald-500" />
                  {team}
                </div>
              ))}
              <button className="px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-white/20 text-xs font-bold text-neutral-500 hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                + Add Team
              </button>
            </div>
          </section>

          {/* Settings Section */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Bell size={16} />
              Notifications
            </h4>
            <div className="divide-y divide-neutral-100 dark:divide-white/5 rounded-xl border border-neutral-100 dark:border-white/10 bg-neutral-50/50 dark:bg-white/2">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Match Alerts
                  </p>
                  <p className="text-xs text-neutral-500">
                    Kickoff and goal updates
                  </p>
                </div>
                <div className="h-6 w-10 rounded-full bg-emerald-500 p-1 cursor-pointer">
                  <div className="size-4 rounded-full bg-white shadow-sm translate-x-4" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    News Feed
                  </p>
                  <p className="text-xs text-neutral-500">
                    Daily tournament updates
                  </p>
                </div>
                <div className="h-6 w-10 rounded-full bg-neutral-300 dark:bg-neutral-800 p-1 cursor-pointer">
                  <div className="size-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Theme Toggle */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Monitor size={16} />
              Appearance
            </h4>
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5">
              {[
                { name: "light", icon: Sun, label: "Light" },
                { name: "dark", icon: Moon, label: "Dark" },
                { name: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs font-bold transition-all",
                    theme === t.name
                      ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100",
                  )}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto p-6 border-t border-neutral-100 dark:border-white/10">
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/30"
          >
            Sign Out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

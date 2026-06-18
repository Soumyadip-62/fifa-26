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
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-black/5 dark:border-white/10 hover:border-primary transition-all duration-300"
        >
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-750 dark:text-zinc-300">
            <User size={20} />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,28rem)] max-w-none rounded-l-2xl rounded-r-none rounded-t-none border-l border-black/5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg dark:border-white/10 shadow-2xl">
        <DrawerHeader className="relative pb-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-black font-heading text-zinc-950 dark:text-white">
              My Profile
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border border-black/5 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <X size={16} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Profile Section */}
          <section className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="size-24 rounded-full bg-linear-to-tr from-primary to-accent p-1 shadow-xl">
                  <div className="h-full w-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <User size={48} className="text-zinc-400" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-zinc-950 text-white border-2 border-white dark:border-zinc-900 shadow-lg hover:scale-110 transition-transform">
                  <Camera size={14} />
                </button>
              </div>

              <div className="text-center w-full max-w-[240px]">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary text-center font-bold"
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
                    <h3 className="text-lg font-black text-zinc-950 dark:text-white group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    <Settings
                      size={14}
                      className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                )}
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-semibold">
                  FIFA Fan since 2024
                </p>
              </div>
            </div>
          </section>

          {/* Favourite Teams */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Heart size={14} fill="currentColor" />
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
                  className="px-3.5 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-zinc-100/60 dark:bg-zinc-800/40 text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <div className="size-1.5 rounded-full bg-primary" />
                  {team}
                </div>
              ))}
              <button className="px-3.5 py-1.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:border-primary hover:text-primary transition-colors">
                + Add Team
              </button>
            </div>
          </section>

          {/* Settings Section */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Bell size={14} />
              Notifications
            </h4>
            <div className="divide-y divide-black/5 dark:divide-white/5 rounded-[20px] border border-black/5 dark:border-white/10 bg-zinc-100/50 dark:bg-zinc-800/10">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Match Alerts
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Kickoff and goal updates
                  </p>
                </div>
                <div className="h-6 w-10 rounded-full bg-primary p-1 cursor-pointer">
                  <div className="size-4 rounded-full bg-white shadow-sm translate-x-4" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    News Feed
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Daily tournament updates
                  </p>
                </div>
                <div className="h-6 w-10 rounded-full bg-zinc-300 dark:bg-zinc-800 p-1 cursor-pointer">
                  <div className="size-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Theme Toggle */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Monitor size={14} />
              Appearance
            </h4>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800/40 border border-black/5 dark:border-white/5">
              {[
                { name: "light", icon: Sun, label: "Light" },
                { name: "dark", icon: Moon, label: "Dark" },
                { name: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t.name)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-2.5 rounded-full text-xs font-bold transition-all",
                    theme === t.name
                      ? "bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                  )}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto p-6 border-t border-black/5 dark:border-white/10">
          <Button
            variant="outline"
            className="w-full h-11 rounded-full text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 dark:border-destructive/20"
          >
            Sign Out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

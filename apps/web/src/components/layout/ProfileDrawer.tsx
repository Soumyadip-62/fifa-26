"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreferences, updatePreferences } from "@/lib/preferences";
import * as React from "react";
import { Bell, Heart, Settings, X, Plus, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { getTeams } from "@/lib/api/teams";
import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/api/notification";
import { images } from "@/assets";
import type { Team } from "@/types/team";
import { useQuery } from "@tanstack/react-query";
import { replayWebsiteTour } from "@/lib/website-tour";
import { useNotificationAccess } from "@/lib/use-notification-access";

const emptyTeams: Team[] = [];

function getTeamSearchText(team: Team) {
  return [
    team.name,
    team.country,
    team.shortCode,
    team.fifa_code,
    team.name_normalised,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ProfileDrawer() {
  const preferences = usePreferences();
  const notificationAccess = useNotificationAccess();
  const replayAfterClose = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [teamInput, setTeamInput] = React.useState("");
  const [isTeamAutocompleteOpen, setIsTeamAutocompleteOpen] =
    React.useState(false);
  const [activeTeamSuggestionIndex, setActiveTeamSuggestionIndex] =
    React.useState(0);
  const [notificationPreferences, setNotificationPreferences] =
    React.useState<NotificationPreferences>(defaultNotificationPreferences);
  const { data: teams = emptyTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    enabled: open,
  });

  const favoriteTeamSuggestions = React.useMemo(() => {
    const query = teamInput.trim().toLowerCase();
    const selectedTeams = new Set(
      notificationPreferences.favoriteTeams.map((team) => team.toLowerCase()),
    );

    if (!query) {
      return [];
    }

    return teams
      .filter((team) => !selectedTeams.has(team.name.toLowerCase()))
      .filter((team) => getTeamSearchText(team).includes(query))
      .slice(0, 8);
  }, [notificationPreferences.favoriteTeams, teamInput, teams]);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setNotificationPreferences({
      favoriteTeams: preferences.teamIds.map(
        (id) => teams.find((t) => t.id === id)?.name ?? id,
      ),
      kickoff30: preferences.notifications.kickoff30,
      kickoff10: preferences.notifications.kickoff10,
      finalScore: preferences.notifications.finalScore,
      qualification: false,
    });
    setMounted(true);
  }, [preferences, teams]);

  if (!mounted) return null;

  const updateNotificationPreferences = (
    updater: (value: NotificationPreferences) => NotificationPreferences,
  ) => {
    const next = updater(notificationPreferences);
    updatePreferences((p) => ({
      ...p,
      teamIds: next.favoriteTeams.flatMap((name) => {
        const team = teams.find((t) => t.name === name || t.id === name);
        return team ? [team.id] : [];
      }),
      notifications: {
        ...p.notifications,
        kickoff30: next.kickoff30,
        kickoff10: next.kickoff10,
        finalScore: next.finalScore,
      },
    }));
  };

  const addFavoriteTeam = () => {
    const team = teamInput.trim();
    if (!team) return;

    updateNotificationPreferences((current) => ({
      ...current,
      favoriteTeams: Array.from(new Set([...current.favoriteTeams, team])),
    }));
    setTeamInput("");
    setIsTeamAutocompleteOpen(false);
    setActiveTeamSuggestionIndex(0);
  };

  const addFavoriteTeamByName = (teamName: string) => {
    const team = teamName.trim();
    if (!team) return;

    updateNotificationPreferences((current) => ({
      ...current,
      favoriteTeams: Array.from(new Set([...current.favoriteTeams, team])),
    }));
    setTeamInput("");
    setIsTeamAutocompleteOpen(false);
    setActiveTeamSuggestionIndex(0);
  };

  const handleTeamInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (!isTeamAutocompleteOpen || favoriteTeamSuggestions.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        addFavoriteTeam();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveTeamSuggestionIndex(
        (index) => (index + 1) % favoriteTeamSuggestions.length,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveTeamSuggestionIndex(
        (index) =>
          (index - 1 + favoriteTeamSuggestions.length) %
          favoriteTeamSuggestions.length,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedTeam = favoriteTeamSuggestions[activeTeamSuggestionIndex];

      if (selectedTeam) {
        addFavoriteTeamByName(selectedTeam.name);
      }
    }

    if (event.key === "Escape") {
      setIsTeamAutocompleteOpen(false);
    }
  };

  const removeFavoriteTeam = (team: string) => {
    updateNotificationPreferences((current) => ({
      ...current,
      favoriteTeams: current.favoriteTeams.filter((item) => item !== team),
    }));
  };

  const togglePreference = (
    key: Exclude<keyof NotificationPreferences, "favoriteTeams">,
  ) => {
    updateNotificationPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const PreferenceToggle = ({
    label,
    description,
    prefKey,
  }: {
    label: string;
    description: string;
    prefKey: Exclude<keyof NotificationPreferences, "favoriteTeams">;
  }) => {
    const enabled = notificationPreferences[prefKey];

    return (
      <button
        type="button"
        onClick={() => togglePreference(prefKey)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
      >
        <div>
          <p className="text-xs font-bold text-foreground dark:text-foreground">
            {label}
          </p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        <span
          className={cn(
            "h-6 w-10 rounded-full p-1 transition-colors",
            enabled ? "bg-primary" : "bg-zinc-300 dark:bg-secondary",
          )}
        >
          <span
            className={cn(
              "block size-4 rounded-full bg-card shadow-none transition-transform",
              enabled && "translate-x-4",
            )}
          />
        </span>
      </button>
    );
  };

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={setOpen}
      onAnimationEnd={(isOpen) => {
        if (!isOpen && replayAfterClose.current) {
          replayAfterClose.current = false;
          replayWebsiteTour();
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button
          aria-label="Open profile settings"
          data-tour="settings"
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-border dark:border-border hover:border-primary transition-all duration-300"
        >
          <div className="flex h-full w-full items-center justify-center bg-secondary dark:bg-secondary text-muted-foreground dark:text-secondary-foreground">
            <Settings size={20} />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,28rem)] max-w-none rounded-l-2xl rounded-r-none rounded-t-none border-l border-border bg-card dark:bg-card backdrop-blur-lg dark:border-border shadow-2xl">
        <DrawerHeader className="relative pb-0">
          <DrawerDescription className="sr-only">
            Manage your favourite teams and match notification preferences.
          </DrawerDescription>
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-black font-heading text-foreground dark:text-white">
              Settings
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                aria-label="Close settings"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border border-border dark:border-border text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white"
              >
                <X size={16} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Favourite Teams */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Heart size={14} fill="currentColor" />
                Favourite Teams
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {notificationPreferences.favoriteTeams.map((team) => (
                <div
                  key={team}
                  className="px-3.5 py-1.5 rounded-full border border-border dark:border-border bg-secondary dark:bg-secondary text-xs font-semibold flex items-center gap-2 shadow-none"
                >
                  <div className="size-1.5 rounded-full bg-primary" />
                  {team}
                  <button
                    type="button"
                    onClick={() => removeFavoriteTeam(team)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {notificationPreferences.favoriteTeams.length === 0 && (
                <p className="text-[10px] font-semibold text-muted-foreground">
                  No favorites. Empty list = all teams.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  value={teamInput}
                  onBlur={() =>
                    setTimeout(() => setIsTeamAutocompleteOpen(false), 120)
                  }
                  onChange={(event) => {
                    setTeamInput(event.target.value);
                    setActiveTeamSuggestionIndex(0);
                    setIsTeamAutocompleteOpen(true);
                  }}
                  onFocus={() => setIsTeamAutocompleteOpen(true)}
                  onKeyDown={handleTeamInputKeyDown}
                  placeholder="Add team name"
                  role="combobox"
                  aria-expanded={isTeamAutocompleteOpen}
                  aria-autocomplete="list"
                  className="h-9 rounded-full text-xs"
                />

                {isTeamAutocompleteOpen &&
                teamInput.trim() &&
                favoriteTeamSuggestions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[18px] border border-border bg-card shadow-xl backdrop-blur-md dark:border-border dark:bg-card">
                    <ul
                      className="max-h-72 overflow-y-auto py-1"
                      role="listbox"
                    >
                      {favoriteTeamSuggestions.map((team, index) => {
                        const imageUrl =
                          team.logoUrl ||
                          team.image_url ||
                          images.teams.default;

                        return (
                          <li
                            key={team.id}
                            role="option"
                            aria-selected={index === activeTeamSuggestionIndex}
                          >
                            <button
                              type="button"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                addFavoriteTeamByName(team.name);
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                                index === activeTeamSuggestionIndex
                                  ? "bg-primary/10 text-foreground dark:text-white"
                                  : "text-muted-foreground hover:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary",
                              )}
                            >
                              <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-secondary dark:bg-secondary">
                                <Image
                                  src={imageUrl}
                                  alt={`${team.name} logo`}
                                  fill
                                  sizes="32px"
                                  className="object-contain p-1.5"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-black">
                                  {team.name}
                                </span>
                                <span className="block truncate text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {team.fifa_code ||
                                    team.shortCode ||
                                    team.country}
                                  {team.group ? ` · Group ${team.group}` : ""}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                onClick={addFavoriteTeam}
                className="h-9 w-9 rounded-full p-0"
              >
                <Plus size={15} />
              </Button>
            </div>
          </section>

          {/* Settings Section */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Bell size={14} />
              Notifications
            </h4>
            <Link
              href="/settings/notifications"
              className="text-xs font-bold text-primary"
            >
              {preferences.notifications.enabled &&
              notificationAccess === "granted"
                ? "Manage browser notifications"
                : "Enable browser notifications"}
            </Link>
            <div className="divide-y divide-border dark:divide-border rounded-lg border border-border dark:border-border bg-secondary dark:bg-secondary">
              <PreferenceToggle
                label="30 min kickoff"
                description="Match reminder before kickoff"
                prefKey="kickoff30"
              />
              <PreferenceToggle
                label="10 min kickoff"
                description="Match reminder before kickoff"
                prefKey="kickoff10"
              />
              <PreferenceToggle
                label="Final score"
                description="Full-time results"
                prefKey="finalScore"
              />
            </div>
          </section>
          <section className="border-t border-border pt-5">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  replayAfterClose.current = true;
                }}
              >
                Replay website tour
              </Button>
            </DrawerClose>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import Image from "next/image";
import * as React from "react";
import {
  Bell,
  Heart,
  Settings,
  X,
  Plus,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { getTeams } from "@/lib/api/teams";
import {
  defaultNotificationPreferences,
  readNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/api/notification";
import { images } from "@/assets";
import type { Team } from "@/types/team";
import { useQuery } from "@tanstack/react-query";

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
  const [mounted, setMounted] = React.useState(false);
  const [teamInput, setTeamInput] = React.useState("");
  const [isTeamAutocompleteOpen, setIsTeamAutocompleteOpen] =
    React.useState(false);
  const [activeTeamSuggestionIndex, setActiveTeamSuggestionIndex] =
    React.useState(0);
  const [notificationPreferences, setNotificationPreferences] =
    React.useState<NotificationPreferences>(defaultNotificationPreferences);
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
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
    setNotificationPreferences(readNotificationPreferences());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const updateNotificationPreferences = (
    updater: (value: NotificationPreferences) => NotificationPreferences,
  ) => {
    setNotificationPreferences((current) => {
      const next = updater(current);
      saveNotificationPreferences(next);
      return next;
    });
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
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            {label}
          </p>
          <p className="text-[10px] text-zinc-500">{description}</p>
        </div>
        <span
          className={cn(
            "h-6 w-10 rounded-full p-1 transition-colors",
            enabled ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-800",
          )}
        >
          <span
            className={cn(
              "block size-4 rounded-full bg-white shadow-sm transition-transform",
              enabled && "translate-x-4",
            )}
          />
        </span>
      </button>
    );
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-black/5 dark:border-white/10 hover:border-primary transition-all duration-300"
        >
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-750 dark:text-zinc-300">
            <Settings size={20} />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="inset-y-0 left-auto right-0 mt-0 h-full max-h-none w-[min(100vw,28rem)] max-w-none rounded-l-2xl rounded-r-none rounded-t-none border-l border-black/5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg dark:border-white/10 shadow-2xl">
        <DrawerHeader className="relative pb-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-black font-heading text-zinc-950 dark:text-white">
              Settings
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
                  className="px-3.5 py-1.5 rounded-full border border-black/5 dark:border-white/10 bg-zinc-100/60 dark:bg-zinc-800/40 text-xs font-semibold flex items-center gap-2 shadow-xs"
                >
                  <div className="size-1.5 rounded-full bg-primary" />
                  {team}
                  <button
                    type="button"
                    onClick={() => removeFavoriteTeam(team)}
                    className="text-zinc-400 hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {notificationPreferences.favoriteTeams.length === 0 && (
                <p className="text-[10px] font-semibold text-zinc-500">
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
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[18px] border border-black/5 bg-white/95 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95">
                    <ul className="max-h-72 overflow-y-auto py-1" role="listbox">
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
                                  ? "bg-primary/10 text-zinc-950 dark:text-white"
                                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70",
                              )}
                            >
                              <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
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
                                <span className="block truncate text-[9px] font-bold uppercase tracking-wider text-zinc-500">
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
            <div className="divide-y divide-black/5 dark:divide-white/5 rounded-[20px] border border-black/5 dark:border-white/10 bg-zinc-100/50 dark:bg-zinc-800/10">
              <PreferenceToggle
                label="30 min kickoff"
                description="Match reminder before kickoff"
                prefKey="kickoff30"
              />
              <PreferenceToggle
                label="10 min kickoff"
                description="Ready for later cron"
                prefKey="kickoff10"
              />
              <PreferenceToggle
                label="Final score"
                description="Ready for full-time updates"
                prefKey="finalScore"
              />
              <PreferenceToggle
                label="Qualification"
                description="Qualified team alerts"
                prefKey="qualification"
              />
            </div>
          </section>

        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const TOUR_STORAGE_KEY = "football:website-tour:v1";
export const TOUR_REPLAY_EVENT = "football:replay-tour";
let handledThisSession = false;

export function tourWasHandled(): boolean {
  if (handledThisSession) return true;
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function finishTour(outcome: "completed" | "skipped") {
  handledThisSession = true;
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, outcome);
  } catch {
    /* The tour still closes when device storage is unavailable. */
  }
}

export function replayWebsiteTour() {
  window.dispatchEvent(new Event(TOUR_REPLAY_EVENT));
}

export const tourSteps = [
  {
    title: "Your matchday starts here",
    description:
      "Use the main navigation to browse matches, competitions and news. Competitions brings together league fixtures, tables and stats.",
    targets: ['[data-tour="navigation"]'],
  },
  {
    title: "Find your next match",
    description:
      "Open Matches for fixtures, live scores and results. Select a match to see its details and save a reminder.",
    targets: ['[data-tour="matches"]'],
  },
  {
    title: "Search football",
    description:
      "Use Search to find teams, players, competitions and matches without browsing every page.",
    targets: ['[data-tour="search"]'],
  },
  {
    title: "Keep your favourites close",
    description:
      "On mobile, Saved holds your favourite teams, players and matches. Settings also lets you manage favourite teams. Look for the heart buttons as you explore.",
    targets: ['[data-tour="saved"]', '[data-tour="settings"]'],
  },
  {
    title: "Choose your match alerts",
    description:
      "Open notification settings from the bell on desktop, or Settings on mobile. Follow a team, choose your reminders, then tap Enable browser notifications and allow permission. You can replay this tour from Settings anytime.",
    targets: ['[data-tour="notifications"]', '[data-tour="settings"]'],
  },
] as const;

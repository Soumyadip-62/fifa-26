"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Match } from "@/types/match";
import { getMatches } from "@/lib/api/matches";

// defining the shape of the context
type MatchContextType = {
  liveMatches: Match[]; // an array of matches
  recentMatch: Match | null; // the most recent finished match
  setLiveMatches: React.Dispatch<React.SetStateAction<Match[]>>; // function to update the array
};

// creating the Context using createContext
const MatchContext = createContext<MatchContextType | undefined>(undefined);

// using provider to provide the state to the children and values for the context
export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [recentMatch, setRecentMatch] = useState<Match | null>(null);

  // Fetch live and finished matches globally so DynamicIsland always has data
  useEffect(() => {
    getMatches().then((matches) => {
      const live = matches.filter(
        (match) => match.status.toLowerCase() === "live"
      );
      setLiveMatches(live);

      const finished = matches
        .filter((match) => match.status.toLowerCase() === "finished")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentMatch(finished[0] || null);
    });
  }, []);

  return (
    <MatchContext.Provider value={{ liveMatches, recentMatch, setLiveMatches }}>
      {children}
    </MatchContext.Provider>
  );
}

// custom hook to use the context
export function useMatchContext() {
  const context = useContext(MatchContext);

  if (!context) {
    throw new Error("useMatchContext must be used inside MatchProvider");
  }

  return context;
}

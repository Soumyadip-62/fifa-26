"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, RefreshCw, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavourite, usePreferences } from "@/lib/preferences";
import type { MatchDetails } from "@/types/football";
import { MatchHero } from "./MatchHero";
import { MatchTimeline } from "./MatchTimeline";
import { MatchStatistics } from "./MatchStatistics";
import { MatchLineups } from "./MatchLineups";
import {
  MatchCoaches,
  MatchInformation,
  MatchNews,
  StadiumDetails,
} from "./MatchDetailsSections";

export function MatchCentre(details: MatchDetails) {
  const { match } = details;
  const preferences = usePreferences();
  const saved = preferences.matchIds.includes(match.id);
  const [shareState, setShareState] = useState("");
  const [saveError, setSaveError] = useState("");
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  useEffect(() => {
    if (match.status !== "live") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible")
        startTransition(() => router.refresh());
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [match.status, router]);

  async function share() {
    try {
      const data = {
        title: `${details.homeTeam.name} vs ${details.awayTeam.name}`,
        url: window.location.href,
      };
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setShareState("Match link copied");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setShareState(
          "Could not share this match. Copy the URL from your browser.",
        );
    }
  }
  function save() {
    try {
      toggleFavourite("matchIds", match.id);
      setSaveError("");
    } catch {
      setSaveError(
        "Could not save this match. Check browser storage permissions.",
      );
    }
  }

  return (
    <div className="page-shell neon-match">
      <div className="nm-toolbar">
        <Link href="/matches" className="nm-back">
          <ArrowLeft aria-hidden="true" />
          <span>Matches</span>
        </Link>
        <h1>
          Match Centre
          <span className="sr-only">
            {" "}
            · {details.homeTeam.name} vs {details.awayTeam.name}
          </span>
        </h1>
        <div className="nm-toolbar-actions">
          <Button
            size="sm"
            variant="outline"
            className="nm-icon-button"
            aria-label={saved ? "Remove saved match" : "Save match"}
            aria-pressed={saved}
            onClick={save}
          >
            <Star className={saved ? "fill-current" : ""} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="nm-icon-button"
            aria-label="Share match"
            onClick={() => void share()}
          >
            {shareState === "Match link copied" ? <Check /> : <Share2 />}
          </Button>
        </div>
      </div>
      {shareState || saveError ? (
        <p className="nm-feedback" role="status">
          {saveError || shareState}
        </p>
      ) : null}
      {details.freshness?.stale ? (
        <p className="nm-freshness" role="status">
          Showing saved match details · Updated{" "}
          {new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
          }).format(new Date(details.freshness.fetchedAt))}{" "}
          IST
        </p>
      ) : null}
      <MatchHero details={details} />
      {match.status === "live" ? (
        <div className="nm-live-update" role="status">
          <span />
          <span>
            {refreshing ? "Updating match…" : "Live updates every minute"}
          </span>
          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            disabled={refreshing}
          >
            <RefreshCw aria-hidden="true" />
            Refresh
          </button>
        </div>
      ) : null}
      <div className="nm-dashboard">
        <div className="nm-sidebar">
          <MatchInformation details={details} />
          <MatchCoaches
            homeTeam={details.homeTeam}
            awayTeam={details.awayTeam}
            lineups={details.lineups}
          />
          <StadiumDetails
            stadium={details.stadium}
            venue={details.venue}
            availability={details.availability}
          />
        </div>
        <MatchTimeline details={details} />
        <MatchStatistics details={details} />
        <MatchLineups details={details} />
        <MatchNews details={details} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMatchContext } from "Context/MatchContext";
import { cn } from "@/lib/utils/cn";

export function DynamicIsland({
  hasLiveMatch = true,
  inlineMobile = false,
}: {
  hasLiveMatch?: boolean;
  inlineMobile?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { liveMatches, recentMatch } = useMatchContext();

  // Prioritize active live matches; fallback to the most recent finished match
  const match = liveMatches.length > 0 ? liveMatches[0] : recentMatch;

  if (!hasLiveMatch || !match) return null;

  const isLive = match.status.toLowerCase() === "live";
  const getMobileTeamName = (team: typeof match.homeTeam) =>
    (team.shortCode || team.name.slice(0, 3)).toUpperCase();

  const renderExpandedContent = () => (
    <div className="flex sm:flex-row items-center justify-between w-full h-full py-1.5">
      {/* Left Team */}
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3",
          inlineMobile ? "flex-1" : "w-[110px] sm:w-[120px]",
        )}
      >
        <div className="h-10 w-10 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex shrink-0 items-center justify-center border border-white/10 shadow-inner overflow-hidden relative">
          {match.homeTeam.logoUrl || match.homeTeam.flagUrl ? (
            <img
              src={match.homeTeam.logoUrl || match.homeTeam.flagUrl}
              alt={`${match.homeTeam.name} logo`}
              className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
            />
          ) : (
            <span className="text-base sm:text-lg">⚽</span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-xs font-black",
              inlineMobile
                ? "line-clamp-2 leading-tight uppercase"
                : "truncate",
            )}
          >
            {inlineMobile
              ? getMobileTeamName(match.homeTeam)
              : match.homeTeam.name}
          </span>
          {match.stage && (
            <span
              className={cn(
                "text-[10px] text-zinc-400 font-bold",
                inlineMobile ? "line-clamp-2 leading-tight mt-0.5" : "truncate",
              )}
            >
              {match.stage}
            </span>
          )}
        </div>
      </div>

      {/* Score & Time */}
      <div className="flex flex-col items-center justify-center px-1 sm:px-4 shrink-0">
        <div className="flex items-center mb-0.5">
          {isLive ? (
            <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-1.5 sm:px-2 py-[2px] sm:py-[3px] text-[9px] font-bold uppercase tracking-widest text-red-500 leading-none">
              <span className="relative flex h-1 w-1 sm:h-1.5 sm:w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1 w-1 sm:h-1.5 sm:w-1.5 bg-red-500"></span>
              </span>
              <span>LIVE</span>
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 sm:px-2 py-[2px] sm:py-[3px] text-[9px] font-bold uppercase tracking-widest text-amber-400 leading-none">
              FT
            </span>
          )}
        </div>
        <span className="text-xl sm:text-2xl font-black tracking-tighter">
          {match.score.home ?? 0} - {match.score.away ?? 0}
        </span>
      </div>

      {/* Right Team */}
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3 justify-end text-right",
          inlineMobile ? "flex-1" : "w-[110px] sm:w-[120px]",
        )}
      >
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-xs font-black",
              inlineMobile
                ? "line-clamp-2 leading-tight uppercase"
                : "truncate",
            )}
          >
            {inlineMobile
              ? getMobileTeamName(match.awayTeam)
              : match.awayTeam.name}
          </span>
          {match.stage && (
            <span
              className={cn(
                "text-[10px] text-zinc-400 font-bold",
                inlineMobile ? "line-clamp-2 leading-tight mt-0.5" : "truncate",
              )}
            >
              {match.stage}
            </span>
          )}
        </div>
        <div className="h-10 w-10 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex shrink-0 items-center justify-center border border-white/10 shadow-inner overflow-hidden relative">
          {match.awayTeam.logoUrl || match.awayTeam.flagUrl ? (
            <img
              src={match.awayTeam.logoUrl || match.awayTeam.flagUrl}
              alt={`${match.awayTeam.name} logo`}
              className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
            />
          ) : (
            <span className="text-base sm:text-lg">⚽</span>
          )}
        </div>
      </div>
    </div>
  );

  if (inlineMobile) {
    return (
      <div className="md:hidden w-full bg-black/80 backdrop-blur-3xl text-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/10 p-2 sm:p-3">
        {renderExpandedContent()}
      </div>
    );
  }

  return (
    <div className="relative flex justify-center w-full z-50 h-[32px]">
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="absolute top-0 cursor-pointer bg-black/80 backdrop-blur-3xl text-white rounded-[20px] flex items-center justify-between shadow-lg overflow-hidden border border-white/10 select-none"
        style={{
          width: isExpanded ? "min(380px, 92vw)" : "180px",
          height: isExpanded ? "80px" : "32px",
          paddingLeft: isExpanded ? "12px" : "10px",
          paddingRight: isExpanded ? "12px" : "10px",
          boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.1)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-between w-full text-[12px] font-bold tracking-wide"
            >
              <div className="flex items-center gap-1.5">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-[3px] text-[9px] font-bold uppercase tracking-widest text-red-500 leading-none">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span>LIVE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-[3px] text-[9px] font-bold uppercase tracking-widest text-amber-400 leading-none">
                    FT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {match.homeTeam.shortCode ||
                    match.homeTeam.name.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-white/60 font-medium">
                  {match.score.home ?? 0} - {match.score.away ?? 0}
                </span>
                <span>
                  {match.awayTeam.shortCode ||
                    match.awayTeam.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full"
            >
              {renderExpandedContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

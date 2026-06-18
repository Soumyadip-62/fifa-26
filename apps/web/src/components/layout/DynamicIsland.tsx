"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Tv, Calendar } from "lucide-react";

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative flex justify-center w-full z-50">
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="cursor-pointer bg-black text-white rounded-[24px] flex items-center justify-between shadow-lg overflow-hidden border border-white/10 select-none"
        style={{
          width: isExpanded ? "340px" : "180px",
          height: isExpanded ? "70px" : "32px",
          paddingLeft: isExpanded ? "16px" : "10px",
          paddingRight: isExpanded ? "16px" : "10px",
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
              className="flex items-center justify-between w-full text-[11px] font-semibold tracking-wide"
            >
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>FIFA 26 Live</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <Trophy className="h-3 w-3" />
                <span>104 fixtures</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full h-full py-1"
            >
              <div className="flex flex-col gap-0.5 justify-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tournament Live</p>
                <h4 className="text-xs font-black tracking-normal flex items-center gap-1 text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                  Road to 2026 Finals
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition">
                  <Tv className="h-4 w-4" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

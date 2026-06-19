"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Tv, Calendar } from "lucide-react";

export function DynamicIsland({ hasLiveMatch = true }: { hasLiveMatch?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasLiveMatch) return null;

  return (
    <div className="relative flex justify-center w-full z-50 h-[32px]">
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="absolute top-0 cursor-pointer bg-black/80 backdrop-blur-3xl text-white rounded-[32px] flex items-center justify-between shadow-lg overflow-hidden border border-white/10 select-none"
        style={{
          width: isExpanded ? "380px" : "180px",
          height: isExpanded ? "80px" : "32px",
          paddingLeft: isExpanded ? "16px" : "12px",
          paddingRight: isExpanded ? "16px" : "12px",
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
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-red-500">75'</span>
              </div>
              <div className="flex items-center gap-2">
                <span>ARG</span>
                <span className="text-white/60 font-medium">2 - 1</span>
                <span>FRA</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full h-full py-2 px-2"
            >
              {/* Left Team - Argentina */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg border border-white/20 shadow-inner">
                  🇦🇷
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black">Argentina</span>
                  <span className="text-[10px] text-zinc-400 font-bold">Messi 23', 67'</span>
                </div>
              </div>

              {/* Score & Time */}
              <div className="flex flex-col items-center justify-center px-4">
                <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                  </span>
                  75'
                </div>
                <span className="text-xl font-black tracking-tighter">2 - 1</span>
              </div>

              {/* Right Team - France */}
              <div className="flex items-center gap-3 text-right">
                <div className="flex flex-col">
                  <span className="text-sm font-black">France</span>
                  <span className="text-[10px] text-zinc-400 font-bold">Mbappé 45'</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-lg border border-white/20 shadow-inner">
                  🇫🇷
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

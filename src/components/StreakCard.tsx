import React, { useState } from "react";
import {
  Flame,
  Trophy,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { StreakInfo } from "../types";
import { getStreakLevel } from "../utils/streak";
import { StreakModal } from "./StreakModal";

interface StreakCardProps {
  streak: StreakInfo;
  selectedDate: string;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak, selectedDate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const level = getStreakLevel(streak.currentStreak);

  // Compute the last 7 days for the visual tracker dots
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const isToday = i === 6;
    const isLogged = !!streak.history[key];
    return { key, dayName, isToday, isLogged };
  });

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-3.5 relative overflow-hidden group cursor-pointer hover:border-amber-500/60 transition-all shadow-lg active:scale-[0.99]"
      >
        {/* Ambient flame glow if active */}
        <div
          className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all ${
            streak.isActiveToday ? "bg-amber-500/15" : "bg-orange-500/5"
          }`}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Animated Flame Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                streak.isActiveToday
                  ? "bg-amber-950/80 border-amber-500/80 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse"
                  : streak.currentStreak > 0
                  ? "bg-neutral-900 border-neutral-700 text-orange-400"
                  : "bg-neutral-900 border-neutral-800 text-neutral-500"
              }`}
            >
              <Flame className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold font-mono text-white tracking-tight">
                  {streak.currentStreak} Day Streak
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-amber-400 font-semibold">
                  {level.title}
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-400 mt-0.5 flex items-center gap-1">
                {streak.isActiveToday ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Logged today • Flame burning!
                  </span>
                ) : streak.currentStreak > 0 ? (
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Log today to keep streak alive!
                  </span>
                ) : (
                  <span className="text-neutral-500">Log a meal or water to ignite streak!</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-neutral-400 group-hover:text-white transition-colors">
            <span className="text-[10px] font-mono text-neutral-500 group-hover:text-amber-400">
              Badges
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400" />
          </div>
        </div>

        {/* 7-Day Mini Tracker Dots */}
        <div className="mt-3 pt-2.5 border-t border-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {last7Days.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-1">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono border transition-all ${
                    d.isLogged
                      ? "bg-amber-950 border-amber-500 text-amber-300 font-bold"
                      : d.isToday
                      ? "bg-neutral-900 border-amber-600/60 text-amber-400 border-dashed"
                      : "bg-neutral-900/50 border-neutral-800 text-neutral-600"
                  }`}
                >
                  {d.isLogged ? (
                    "✓"
                  ) : d.isToday ? (
                    <Flame className="w-3 h-3 text-amber-400" />
                  ) : (
                    "·"
                  )}
                </div>
                <span className="text-[9px] font-mono text-neutral-500">
                  {d.dayName}
                </span>
              </div>
            ))}
          </div>

          <div className="text-right">
            <div className="text-[9px] font-mono text-neutral-500">Best Record</div>
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center justify-end gap-1">
              <Trophy className="w-3 h-3 text-amber-400 inline" />
              <span>{streak.longestStreak} days</span>
            </div>
          </div>
        </div>
      </div>

      <StreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        streak={streak}
      />
    </>
  );
};

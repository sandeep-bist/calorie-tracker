import React from "react";
import {
  X,
  Flame,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  Share2,
  Calendar,
} from "lucide-react";
import { StreakInfo } from "../types";
import { getStreakLevel, getGamifiedBadges } from "../utils/streak";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: StreakInfo;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streak,
}) => {
  if (!isOpen) return null;

  const level = getStreakLevel(streak.currentStreak);
  const badges = getGamifiedBadges(streak.currentStreak, streak.totalDaysLogged);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleShareStreak = async () => {
    const text = `🔥 I'm on a ${streak.currentStreak}-day healthy eating & macro tracking streak on Calorie & Protein Tracker! Current Level: ${level.title}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Tracking Streak",
          text,
        });
      } catch {
        // ignore dismiss
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Streak summary copied to clipboard!");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 safe-bottom"
    >
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              Streak & Gamified Badges
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Flame Showcase */}
        <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-neutral-900/60 to-black border border-amber-500/30 relative overflow-hidden">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-950/80 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] mb-3 animate-bounce">
            <Flame className="w-12 h-12 fill-current" />
          </div>

          <div className="text-3xl font-bold font-mono text-white tracking-tight">
            {streak.currentStreak} Days
          </div>
          <div className="text-xs font-mono text-amber-300 font-semibold mt-0.5">
            {level.title}
          </div>

          <p className="text-[11px] text-neutral-400 max-w-xs mx-auto mt-2 leading-relaxed">
            {streak.isActiveToday
              ? "Flame locked in for today! You're building unstoppable momentum."
              : streak.currentStreak > 0
              ? "Your streak is on the line today! Log your meal or water to keep it burning."
              : "Every legendary streak starts with Day 1. Log a meal today to ignite your flame!"}
          </p>

          {/* Level Progress Bar */}
          <div className="mt-4 max-w-xs mx-auto space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span>Level {level.level}</span>
              <span>Next Goal: {level.nextThreshold} Days</span>
            </div>
            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                style={{ width: `${level.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 gap-2 font-mono">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] text-neutral-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              Longest Streak
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {streak.longestStreak} Days
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] text-neutral-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-400" />
              Total Days Logged
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {streak.totalDaysLogged} Days
            </div>
          </div>
        </div>

        {/* Milestone Badges Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 font-bold">
              Milestone Badges ({unlockedCount}/{badges.length} Unlocked)
            </span>
            <span className="text-amber-400 text-[10px]">
              {Math.round((unlockedCount / badges.length) * 100)}% Complete
            </span>
          </div>

          <div className="space-y-2">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  badge.unlocked
                    ? "bg-neutral-900/80 border-amber-500/50 shadow-sm"
                    : "bg-neutral-950 border-neutral-900 opacity-60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
                      badge.unlocked
                        ? "bg-amber-950/60 border-amber-500/60 text-amber-300"
                        : "bg-neutral-900 border-neutral-800 text-neutral-600"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <span>{badge.title}</span>
                      {badge.unlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {badge.desc}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px]">
                  {badge.unlocked ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                      Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {streak.currentStreak}/{badge.requiredStreak}d
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleShareStreak}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black font-bold font-mono text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-950/40"
          >
            <Share2 className="w-4 h-4" />
            <span>Share My Streak & Achievements</span>
          </button>
        </div>
      </div>
    </div>
  );
};

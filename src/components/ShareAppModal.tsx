import React, { useState } from "react";
import { X, Share2, Copy, Check, Sparkles, Smartphone, Flame, Dumbbell } from "lucide-react";
import { Meal, DailyTargets } from "../types";
import { formatDateLabel } from "../utils/storage";

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  meals: Meal[];
  targets: DailyTargets;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  meals,
  targets,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const dateFormatted = formatDateLabel(selectedDate);

  const appUrl = window.location.origin;

  const summaryText = `🔥 MacroScan Night Log • ${dateFormatted}
Calories: ${totalCalories} / ${targets.calories} kcal (${Math.round((totalCalories / targets.calories) * 100)}%)
Protein: ${totalProtein}g / ${targets.protein}g (${Math.round((totalProtein / targets.protein) * 100)}%)
Meals logged: ${meals.length}

Track your macros instantly with AI: ${appUrl}`;

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MacroScan - Calorie & Protein AI Tracker",
          text: "Check out MacroScan — a minimalist high-contrast dark theme calorie & protein tracker with AI meal photo analysis!",
          url: appUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareSummary = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MacroScan Summary - ${dateFormatted}`,
          text: summaryText,
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-400">
              <Share2 className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-white block">
                Share MacroScan
              </span>
              <span className="text-[10px] text-neutral-400">
                Share your daily progress or invite friends
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Today's Card Preview */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-mono">{dateFormatted} Daily Snapshot</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-900 text-emerald-400 font-mono">
              {meals.length} Meals
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-black/60 border border-neutral-800 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-neutral-400 font-mono uppercase">Calories</div>
                <div className="text-sm font-bold font-mono text-white">
                  {totalCalories}{" "}
                  <span className="text-[10px] text-neutral-500 font-normal">/ {targets.calories}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/60 border border-neutral-800 flex items-center space-x-2">
              <Dumbbell className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-neutral-400 font-mono uppercase">Protein</div>
                <div className="text-sm font-bold font-mono text-white">
                  {totalProtein}g{" "}
                  <span className="text-[10px] text-neutral-500 font-normal">/ {targets.protein}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleShareSummary}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Today's Nutrition Card</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? "Copied Stats" : "Copy Stats"}</span>
            </button>

            <button
              type="button"
              onClick={handleShareApp}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{copiedLink ? "Link Copied" : "Share App Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

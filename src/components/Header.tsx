import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
  SlidersHorizontal,
  Apple,
  User as UserIcon,
  Share2,
  MoreVertical,
  LogOut,
  Key,
  ShieldCheck,
  Check,
} from "lucide-react";
import { User } from "firebase/auth";
import { formatDateLabel, getTodayDateString } from "../utils/storage";

interface HeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenSettings: () => void;
  nightMode: "standard" | "ultra_dark" | "night_shift";
  onToggleNightMode: () => void;
  onOpenIOSModal: () => void;
  user: User | null;
  onOpenAuthModal: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  onOpenSettings,
  nightMode,
  onToggleNightMode,
  onOpenIOSModal,
  user,
  onOpenAuthModal,
  onOpenShareModal,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const today = getTodayDateString();
  const isToday = selectedDate === today;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const navigateDay = (offset: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onSelectDate(`${year}-${month}-${day}`);
  };

  const getNightModeLabel = () => {
    if (nightMode === "night_shift") return "Amber Tint (Warm)";
    if (nightMode === "ultra_dark") return "Ultra OLED Dim";
    return "High-Contrast Dark";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-black/95 backdrop-blur-md border-b border-neutral-900 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white font-mono uppercase">
                CAL•PRO
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-mono">
                AI NIGHT
              </span>
            </div>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center bg-neutral-900/80 rounded-full border border-neutral-800 px-1 py-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => navigateDay(-1)}
            aria-label="Previous day"
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSelectDate(today)}
            className="px-2.5 py-1 text-xs font-semibold tracking-wide text-neutral-200 hover:text-white transition-colors"
          >
            {formatDateLabel(selectedDate)}
            {!isToday && (
              <span className="ml-1 text-[10px] text-emerald-400 font-mono">
                (Today)
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateDay(1)}
            disabled={selectedDate >= today}
            aria-label="Next day"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              selectedDate >= today
                ? "text-neutral-700 cursor-not-allowed"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action: Clean Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open App Menu"
            className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all active:scale-95"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover border border-emerald-500/50"
              />
            ) : user ? (
              <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-[10px] font-bold text-emerald-300 font-mono">
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <MoreVertical className="w-4 h-4 text-neutral-400" />
            {user && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
            )}
          </button>

          {/* Top Right Dropdown Modal Card */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-950/98 border border-neutral-800 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 space-y-1 font-sans">
              {/* Account Item */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-neutral-900 transition-colors text-left group"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 group-hover:border-neutral-700">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {user ? user.displayName || user.email : "Account & Cloud Sync"}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    {user ? "Cloud Sync Active" : "Sign In with Google"}
                  </div>
                </div>
              </button>

              <div className="h-px bg-neutral-900 my-1" />

              {/* Night Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  onToggleNightMode();
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900 transition-colors text-left group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Night Vision</div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      {getNightModeLabel()}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 group-hover:text-amber-400">
                  Cycle ⟳
                </span>
              </button>

              {/* Apple iOS Setup */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenIOSModal();
                }}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-neutral-900 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                  <Apple className="w-4 h-4 fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">iOS App Setup</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Add to iPhone Home Screen
                  </div>
                </div>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenShareModal();
                }}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-neutral-900 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sky-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">Share App & Stats</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Export nutrition report
                  </div>
                </div>
              </button>

              <div className="h-px bg-neutral-900 my-1" />

              {/* Settings / Targets / API Key */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-neutral-900 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">Goals & Gemini API Key</div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    Targets & custom AI key
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

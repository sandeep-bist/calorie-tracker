import React from "react";
import { Camera, Plus, SlidersHorizontal, Moon } from "lucide-react";

interface BottomBarProps {
  onOpenScanner: () => void;
  onOpenManual: () => void;
  onOpenSettings: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  onOpenScanner,
  onOpenManual,
  onOpenSettings,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-neutral-900 px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Quick Log */}
        <button
          type="button"
          onClick={onOpenManual}
          className="flex-1 flex flex-col items-center py-1 text-neutral-400 hover:text-white transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
            <Plus className="w-5 h-5 text-neutral-300 group-hover:text-emerald-400" />
          </div>
          <span className="text-[10px] font-mono tracking-tight">Quick Log</span>
        </button>

        {/* Center Prominent AI Camera Scan Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenScanner}
            aria-label="Scan Meal Photo"
            className="w-14 h-14 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95 transition-all border-4 border-black"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {/* Targets / Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex-1 flex flex-col items-center py-1 text-neutral-400 hover:text-white transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-neutral-300 group-hover:text-sky-400" />
          </div>
          <span className="text-[10px] font-mono tracking-tight">Targets</span>
        </button>
      </div>
    </nav>
  );
};

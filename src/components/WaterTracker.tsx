import React, { useState } from "react";
import {
  Droplets,
  Plus,
  Minus,
  Sparkles,
  Check,
  RotateCcw,
  Edit2,
  X,
} from "lucide-react";

interface WaterTrackerProps {
  currentMl: number;
  targetMl: number;
  onUpdateWater: (newAmount: number) => void;
  selectedDateLabel: string;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  currentMl,
  targetMl,
  onUpdateWater,
  selectedDateLabel,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<"ml" | "litre">("ml");

  const effectiveTarget = targetMl || 3000;
  const currentL = (currentMl / 1000).toFixed(currentMl % 1000 === 0 ? 0 : 2);
  const targetL = (effectiveTarget / 1000).toFixed(effectiveTarget % 1000 === 0 ? 0 : 1);
  const percent = Math.min(100, Math.round((currentMl / effectiveTarget) * 100));
  const remainingMl = effectiveTarget - currentMl;
  const isTargetAchieved = currentMl >= effectiveTarget;

  const handleAddQuick = (amount: number) => {
    onUpdateWater(Math.max(0, currentMl + amount));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customValue);
    if (!isNaN(val) && val >= 0) {
      const mlToAdd = customUnit === "litre" ? Math.round(val * 1000) : Math.round(val);
      onUpdateWater(Math.max(0, currentMl + mlToAdd));
      setCustomValue("");
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 relative overflow-hidden group shadow-lg">
      {/* Background glow on target achieved */}
      {isTargetAchieved && (
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-neutral-400 text-xs font-mono tracking-wider uppercase">
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>Water Intake</span>
          <span className="text-[10px] text-neutral-500 lowercase">({selectedDateLabel})</span>
        </div>
        <div className="flex items-center space-x-2">
          {currentMl > 0 && (
            <button
              type="button"
              onClick={() => onUpdateWater(0)}
              title="Reset day water"
              className="text-neutral-500 hover:text-neutral-300 p-0.5 text-[10px] font-mono flex items-center gap-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-cyan-300 font-semibold">
            {percent}%
          </span>
        </div>
      </div>

      {/* Main volume readout */}
      <div className="my-1.5 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {currentL}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            / {targetL} L
          </span>
          <span className="text-[11px] text-neutral-400 font-mono ml-1">
            ({currentMl.toLocaleString()} ml)
          </span>
        </div>

        <div className="text-xs font-mono text-right">
          {isTargetAchieved ? (
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> Goal Reached!
            </span>
          ) : (
            <span className="text-neutral-400">
              {(remainingMl / 1000).toFixed(1)} L left
            </span>
          )}
        </div>
      </div>

      {/* Animated Liquid Progress Bar */}
      <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800/60 my-2.5">
        <div
          className={`h-full transition-all duration-500 ${
            isTargetAchieved
              ? "bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              : "bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handleAddQuick(250)}
          className="py-1.5 px-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 active:scale-95 transition-all text-center group/btn"
        >
          <div className="text-[11px] font-mono font-bold text-white group-hover/btn:text-cyan-300">
            +250 ml
          </div>
          <div className="text-[9px] text-neutral-500 font-mono">1 Glass</div>
        </button>

        <button
          type="button"
          onClick={() => handleAddQuick(500)}
          className="py-1.5 px-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 active:scale-95 transition-all text-center group/btn"
        >
          <div className="text-[11px] font-mono font-bold text-white group-hover/btn:text-cyan-300">
            +500 ml
          </div>
          <div className="text-[9px] text-neutral-500 font-mono">1 Bottle</div>
        </button>

        <button
          type="button"
          onClick={() => handleAddQuick(1000)}
          className="py-1.5 px-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 active:scale-95 transition-all text-center group/btn"
        >
          <div className="text-[11px] font-mono font-bold text-white group-hover/btn:text-cyan-300">
            +1.0 L
          </div>
          <div className="text-[9px] text-neutral-500 font-mono">1 Litre</div>
        </button>

        <button
          type="button"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className={`py-1.5 px-1 rounded-xl border active:scale-95 transition-all text-center ${
            isCustomOpen
              ? "bg-cyan-950 border-cyan-500 text-cyan-300"
              : "bg-neutral-900 hover:bg-neutral-800 border-neutral-800/80 text-neutral-300"
          }`}
        >
          <div className="text-[11px] font-mono font-bold flex items-center justify-center gap-0.5">
            <Edit2 className="w-2.5 h-2.5 text-cyan-400" />
            <span>Custom</span>
          </div>
          <div className="text-[9px] text-neutral-500 font-mono">Add ml / L</div>
        </button>
      </div>

      {/* Undo Button if user logged something */}
      {currentMl > 0 && (
        <div className="flex items-center justify-between pt-1.5 text-[10px] font-mono text-neutral-500">
          <button
            type="button"
            onClick={() => handleAddQuick(-250)}
            className="hover:text-neutral-300 flex items-center gap-1 active:scale-95"
          >
            <Minus className="w-3 h-3 text-neutral-400" />
            <span>Undo 250ml</span>
          </button>
          <span>Target: {targetL} L / day</span>
        </div>
      )}

      {/* Custom Log Mini-Form Drawer */}
      {isCustomOpen && (
        <form
          onSubmit={handleCustomSubmit}
          className="mt-2.5 p-2.5 rounded-xl bg-black border border-cyan-900/60 space-y-2 animate-in fade-in slide-in-from-top-1"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-300">
            <span>Log Custom Water Amount:</span>
            <button
              type="button"
              onClick={() => setIsCustomOpen(false)}
              className="text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              min="1"
              required
              placeholder={customUnit === "ml" ? "e.g. 350" : "e.g. 0.75"}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-cyan-500"
            />

            <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => setCustomUnit("ml")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  customUnit === "ml" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-neutral-400"
                }`}
              >
                ml
              </button>
              <button
                type="button"
                onClick={() => setCustomUnit("litre")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  customUnit === "litre" ? "bg-cyan-950 text-cyan-400 font-bold" : "text-neutral-400"
                }`}
              >
                Litre
              </button>
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold transition-all active:scale-95"
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

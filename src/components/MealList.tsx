import React, { useState } from "react";
import { Camera, Plus, Moon, Star } from "lucide-react";
import { Meal } from "../types";
import { MealCard } from "./MealCard";

interface MealListProps {
  meals: Meal[];
  onDelete: (id: string) => void;
  onUpdate: (updated: Meal) => void;
  onRepeat?: (meal: Meal) => void;
  onOpenScanner: () => void;
  onOpenManual: () => void;
}

export const MealList: React.FC<MealListProps> = ({
  meals,
  onDelete,
  onUpdate,
  onRepeat,
  onOpenScanner,
  onOpenManual,
}) => {
  const [filterView, setFilterView] = useState<"all" | "favorites">("all");

  // Sort latest meals first
  const sortedMeals = [...meals].sort((a, b) => {
    return b.timestamp.localeCompare(a.timestamp);
  });

  const favoriteCount = sortedMeals.filter((m) => m.isFavorite).length;
  const displayedMeals =
    filterView === "favorites" ? sortedMeals.filter((m) => m.isFavorite) : sortedMeals;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setFilterView("all")}
            className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-lg border transition-all ${
              filterView === "all"
                ? "bg-neutral-800 text-white border-neutral-700 font-bold"
                : "bg-transparent text-neutral-500 border-transparent hover:text-neutral-300"
            }`}
          >
            All Logs ({sortedMeals.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterView("favorites")}
            className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 ${
              filterView === "favorites"
                ? "bg-amber-950/60 text-amber-300 border-amber-600/50 font-bold"
                : "bg-transparent text-neutral-500 border-transparent hover:text-amber-400"
            }`}
          >
            <Star className={`w-3 h-3 ${filterView === "favorites" ? "fill-amber-300" : ""}`} />
            <span>Favorites ({favoriteCount})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenManual}
            className="text-xs font-mono text-neutral-300 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {displayedMeals.length > 0 ? (
        <div className="space-y-2.5">
          {displayedMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onRepeat={onRepeat}
            />
          ))}
        </div>
      ) : filterView === "favorites" ? (
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center mx-auto text-amber-400">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-semibold text-neutral-200 font-mono">
            No favorite meals yet
          </h3>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
            Tap the ⭐ star button on any meal card to pin it here for quick access.
          </p>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Moon className="w-6 h-6 text-neutral-500" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-200">
              No meals logged for this day
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Snap a food photo for instant AI calorie & protein analysis, or log quickly with text.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Meal Photo</span>
            </button>

            <button
              type="button"
              onClick={onOpenManual}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Flame, Dumbbell, Sparkles, Moon } from "lucide-react";
import { DailyTargets, Meal } from "../types";

interface DailySummaryProps {
  meals: Meal[];
  targets: DailyTargets;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ meals, targets }) => {
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const caloriesRemaining = targets.calories - totalCalories;
  const proteinRemaining = targets.protein - totalProtein;

  const calPercent = Math.min(100, Math.round((totalCalories / targets.calories) * 100));
  const proPercent = Math.min(100, Math.round((totalProtein / targets.protein) * 100));

  const nightBites = meals.filter((m) => m.mealType === "night_bite" || m.mealType === "snack");

  return (
    <div className="space-y-3">
      {/* Primary Metrics Card: Calories & Protein */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Calories Card */}
        <div className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-neutral-400 text-xs font-mono tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calories</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              {calPercent}%
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                {totalCalories.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                / {targets.calories.toLocaleString()} kcal
              </span>
            </div>

            <div className="text-xs mt-1 font-mono">
              {caloriesRemaining >= 0 ? (
                <span className="text-emerald-400 font-medium">
                  {caloriesRemaining.toLocaleString()} kcal left
                </span>
              ) : (
                <span className="text-rose-400 font-medium">
                  +{Math.abs(caloriesRemaining).toLocaleString()} kcal over
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800/60">
            <div
              className={`h-full transition-all duration-500 ${
                caloriesRemaining < 0
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-400"
              }`}
              style={{ width: `${calPercent}%` }}
            />
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-neutral-400 text-xs font-mono tracking-wider uppercase">
              <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
              <span>Protein</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              {proPercent}%
            </span>
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                {Math.round(totalProtein)}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                / {targets.protein}g
              </span>
            </div>

            <div className="text-xs mt-1 font-mono">
              {proteinRemaining > 0 ? (
                <span className="text-sky-400 font-medium">
                  {Math.round(proteinRemaining)}g to target
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 inline" /> Target Reached!
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800/60">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${proPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Quick Stats: Night digestion & Macro balance */}
      <div className="bg-neutral-950/60 border border-neutral-900 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5" />
            Carbs: <strong className="ml-1 text-white">{Math.round(totalCarbs)}g</strong>
          </span>
          <span className="flex items-center text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-1.5" />
            Fat: <strong className="ml-1 text-white">{Math.round(totalFat)}g</strong>
          </span>
        </div>

        <div className="flex items-center space-x-1 text-neutral-400">
          <Moon className="w-3 h-3 text-neutral-500" />
          <span>{meals.length} meals</span>
          {nightBites.length > 0 && (
            <span className="text-amber-400 ml-1">({nightBites.length} night)</span>
          )}
        </div>
      </div>
    </div>
  );
};

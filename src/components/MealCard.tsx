import React, { useState } from "react";
import {
  Sparkles,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Moon,
  Coffee,
  Sun,
  Utensils,
  Cookie,
  Check,
  X,
  Repeat,
  Flame,
  Dumbbell,
  Star,
} from "lucide-react";
import { Meal, MealType } from "../types";

interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
  onUpdate: (updated: Meal) => void;
  onRepeat?: (meal: Meal) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onDelete,
  onUpdate,
  onRepeat,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(meal.name);
  const [editCalories, setEditCalories] = useState(meal.calories);
  const [editProtein, setEditProtein] = useState(meal.protein);
  const [editCarbs, setEditCarbs] = useState(meal.carbs || 0);
  const [editFat, setEditFat] = useState(meal.fat || 0);
  const [editType, setEditType] = useState<MealType>(meal.mealType);

  const getMealTypeBadge = (type: MealType) => {
    switch (type) {
      case "breakfast":
        return { label: "Breakfast", icon: Coffee, color: "text-amber-400 bg-amber-950/40 border-amber-800/40" };
      case "lunch":
        return { label: "Lunch", icon: Sun, color: "text-yellow-400 bg-yellow-950/40 border-yellow-800/40" };
      case "dinner":
        return { label: "Dinner", icon: Utensils, color: "text-orange-400 bg-orange-950/40 border-orange-800/40" };
      case "night_bite":
        return { label: "Night Bite", icon: Moon, color: "text-indigo-300 bg-indigo-950/50 border-indigo-700/50" };
      case "snack":
      default:
        return { label: "Snack", icon: Cookie, color: "text-neutral-400 bg-neutral-900 border-neutral-800" };
    }
  };

  const badge = getMealTypeBadge(meal.mealType);
  const BadgeIcon = badge.icon;

  const handleSaveEdit = () => {
    onUpdate({
      ...meal,
      name: editName.trim() || meal.name,
      calories: Number(editCalories) || 0,
      protein: Number(editProtein) || 0,
      carbs: Number(editCarbs) || 0,
      fat: Number(editFat) || 0,
      mealType: editType,
    });
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    onDelete(meal.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-3.5 transition-all hover:border-neutral-700 relative">
      {/* View Mode */}
      {!isEditing ? (
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2.5">
            {/* Meal Image or Fallback Icon */}
            {meal.imageUrl ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-800">
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400">
                <BadgeIcon className="w-5 h-5 text-neutral-300" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mb-1">
                <span
                  className={`inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${badge.color}`}
                >
                  <BadgeIcon className="w-3 h-3" />
                  <span>{badge.label}</span>
                </span>

                <span className="text-[10px] font-mono text-neutral-500">
                  {meal.timestamp}
                </span>

                {meal.aiAnalyzed && (
                  <span className="inline-flex items-center space-x-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI Scanned</span>
                  </span>
                )}

                {meal.isFavorite && (
                  <span className="inline-flex items-center space-x-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-600/50 shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-amber-300" />
                    <span>Favorite</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-white tracking-tight leading-snug line-clamp-2">
                {meal.name}
              </h3>
            </div>

            {/* Action Buttons: Repeat, Favorite, Edit, Delete */}
            <div className="flex items-center space-x-1 text-neutral-500">
              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => onUpdate({ ...meal, isFavorite: !meal.isFavorite })}
                title={meal.isFavorite ? "Favorited meal (tap to remove)" : "Mark as Favorite meal"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  meal.isFavorite
                    ? "text-amber-400 bg-amber-950/60 border border-amber-600/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                    : "text-neutral-400 hover:text-amber-400 hover:bg-neutral-900"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${meal.isFavorite ? "fill-amber-400" : ""}`} />
              </button>

              {onRepeat && (
                <button
                  type="button"
                  onClick={() => onRepeat(meal)}
                  title="Repeat meal today (1-Tap Quick Log)"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-emerald-400 hover:bg-neutral-900 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit / modify meal"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete meal"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-rose-400 hover:bg-neutral-900 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Delete Confirmation Banner */}
          {showDeleteConfirm && (
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-2.5 flex items-center justify-between animate-fadeIn">
              <span className="text-xs text-rose-300 font-mono">
                Delete this meal entry?
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* High-Contrast Macro Badges */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-900">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 shadow-sm">
                <span>{meal.calories}</span>
                <span className="text-[10px] font-normal text-emerald-400">kcal</span>
              </div>

              <div className="bg-sky-950/80 border border-sky-700/60 text-sky-300 font-mono text-xs px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 shadow-sm">
                <span>{meal.protein}g</span>
                <span className="text-[10px] font-normal text-sky-400">protein</span>
              </div>
            </div>

            {meal.items && meal.items.length > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center space-x-1 py-1 px-1.5 rounded"
              >
                <span>{meal.items.length} items</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Expandable Food Item Details */}
          {isExpanded && meal.items && meal.items.length > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-900 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                Item Breakdown
              </div>
              <div className="space-y-1">
                {meal.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-xs py-1.5 px-2 rounded-md bg-neutral-900/60 border border-neutral-800/60 font-mono space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-neutral-200">
                        <span className="font-semibold">{item.name}</span>
                        {item.portion && (
                          <span className="text-neutral-500 ml-1.5">({item.portion})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-400">
                        <span className="text-emerald-400 font-medium">{item.calories} kcal</span>
                        <span className="text-sky-400 font-medium">{item.protein}g P</span>
                      </div>
                    </div>
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="text-[10px] text-sky-400/90 pl-2">
                        ↳ with {item.ingredients.map((ing) => `${ing.portion} ${ing.name}`).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {meal.notes && (
                <div className="text-[11px] text-neutral-400 bg-neutral-900/40 rounded-lg p-2 border border-neutral-800/40 italic">
                  💡 {meal.notes}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold">
              Edit Meal
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="w-7 h-7 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">
              Meal Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-emerald-400 block mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={editCalories}
                onChange={(e) => setEditCalories(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-sky-400 block mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={editProtein}
                onChange={(e) => setEditProtein(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-amber-400 block mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={editCarbs}
                onChange={(e) => setEditCarbs(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-rose-400 block mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={editFat}
                onChange={(e) => setEditFat(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 block mb-1">
              Meal Type
            </label>
            <div className="grid grid-cols-5 gap-1">
              {(["breakfast", "lunch", "dinner", "snack", "night_bite"] as MealType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setEditType(t)}
                  className={`text-[10px] font-mono py-1 rounded border transition-all ${
                    editType === t
                      ? "bg-neutral-800 text-white border-neutral-500 font-semibold"
                      : "bg-neutral-900/60 text-neutral-400 border-neutral-800"
                  }`}
                >
                  {t === "night_bite" ? "Night" : t.charAt(0).toUpperCase() + t.slice(1, 4)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

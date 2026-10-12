export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "night_bite";

export type FoodUnitType =
  | "piece"
  | "gram"
  | "litre"
  | "ml"
  | "bowl"
  | "cup"
  | "scoop"
  | "serving";

export interface MealItemIngredient {
  name: string;
  portion: string;
  calories: number;
  protein: number;
}

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  ingredients?: MealItemIngredient[];
}

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string or HH:mm
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  items?: MealItem[];
  imageUrl?: string;
  notes?: string;
  aiAnalyzed?: boolean;
  isFavorite?: boolean;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  waterTarget?: number; // Target in ml, default 3000 (3.0L)
}

export interface AnalysisResult {
  mealName: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  items: MealItem[];
  nutritionalTakeaway?: string;
  confidence?: "high" | "medium" | "low";
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDaysLogged: number;
  isActiveToday: boolean;
  history: Record<string, boolean>;
}

export interface GamifiedBadge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  requiredStreak: number;
}

export interface SavedMealCombo {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: MealItem[];
  isDefault?: boolean;
}

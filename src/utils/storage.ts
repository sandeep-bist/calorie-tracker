import { Meal, DailyTargets, SavedMealCombo } from "../types";

const MEALS_STORAGE_KEY = "night_cal_meals_v1";
const TARGETS_STORAGE_KEY = "night_cal_targets_v1";

export const DEFAULT_TARGETS: DailyTargets = {
  calories: 2100,
  protein: 150,
  carbs: 210,
  fat: 65,
  waterTarget: 3000, // 3000 ml = 3.0 Litres
};

const WATER_STORAGE_KEY_PREFIX = "night_cal_water_v1_";

export function loadStoredWater(dateStr: string): number {
  try {
    const raw = localStorage.getItem(`${WATER_STORAGE_KEY_PREFIX}${dateStr}`);
    if (!raw) return 0;
    const num = Number(raw);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

export function saveStoredWater(dateStr: string, amountMl: number): void {
  try {
    localStorage.setItem(
      `${WATER_STORAGE_KEY_PREFIX}${dateStr}`,
      Math.max(0, Math.round(amountMl)).toString()
    );
  } catch (err) {
    console.error("Failed to save water intake to localStorage", err);
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return "Today";

  const [y, m, d] = dateStr.split("-").map(Number);
  const targetDate = new Date(y, m - 1, d);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";

  return targetDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function getInitialMeals(): Meal[] {
  const today = getTodayDateString();

  return [
    {
      id: "seed-1",
      date: today,
      timestamp: "08:30",
      name: "3 Scrambled Eggs & Sourdough Toast",
      mealType: "breakfast",
      calories: 420,
      protein: 26,
      carbs: 28,
      fat: 22,
      items: [
        { name: "Whole Eggs (3 large)", portion: "150g", calories: 215, protein: 19 },
        { name: "Sourdough Toast (1 slice)", portion: "50g", calories: 130, protein: 5 },
        { name: "Butter", portion: "10g", calories: 75, protein: 0.1 },
      ],
      aiAnalyzed: true,
      notes: "High morning protein with clean complex carbs.",
    },
    {
      id: "seed-2",
      date: today,
      timestamp: "13:15",
      name: "Grilled Chicken Breast with Jasmine Rice & Broccoli",
      mealType: "lunch",
      calories: 580,
      protein: 52,
      carbs: 64,
      fat: 11,
      items: [
        { name: "Chicken Breast (grilled)", portion: "200g", calories: 330, protein: 46 },
        { name: "Steamed Jasmine Rice", portion: "150g", calories: 195, protein: 4 },
        { name: "Steamed Broccoli Florets", portion: "100g", calories: 35, protein: 2.5 },
      ],
      aiAnalyzed: true,
      notes: "Lean protein powerhouse lunch.",
    },
    {
      id: "seed-3",
      date: today,
      timestamp: "21:40",
      name: "Greek Yogurt Bowl with Whey & Berries",
      mealType: "night_bite",
      calories: 310,
      protein: 34,
      carbs: 24,
      fat: 4,
      items: [
        { name: "0% Plain Greek Yogurt", portion: "200g", calories: 120, protein: 20 },
        { name: "Whey Protein Isolate", portion: "15g", calories: 60, protein: 13 },
        { name: "Fresh Blueberries", portion: "80g", calories: 45, protein: 0.6 },
      ],
      aiAnalyzed: true,
      notes: "Slow-digesting casein and whey for night-time muscle recovery.",
    },
  ];
}

export function loadStoredMeals(): Meal[] {
  try {
    const raw = localStorage.getItem(MEALS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMeals();
      saveStoredMeals(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMeals();
  }
}

export function saveStoredMeals(meals: Meal[]): void {
  try {
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals));
  } catch (err) {
    console.error("Failed to save meals to localStorage", err);
  }
}

export function loadStoredTargets(): DailyTargets {
  try {
    const raw = localStorage.getItem(TARGETS_STORAGE_KEY);
    if (!raw) return DEFAULT_TARGETS;
    return { ...DEFAULT_TARGETS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TARGETS;
  }
}

export function saveStoredTargets(targets: DailyTargets): void {
  try {
    localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(targets));
  } catch (err) {
    console.error("Failed to save targets to localStorage", err);
  }
}

const CUSTOM_API_KEY_STORAGE_KEY = "macroscan_custom_gemini_api_key";

export function loadStoredApiKey(): string {
  try {
    return localStorage.getItem(CUSTOM_API_KEY_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveStoredApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(CUSTOM_API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(CUSTOM_API_KEY_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Failed to save custom API key to localStorage", err);
  }
}

const CUSTOM_MODEL_STORAGE_KEY = "macroscan_gemini_model_choice";
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export const AVAILABLE_GEMINI_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "Fastest • Sub-second",
    desc: "Lightning quick response times, ideal for mobile photo & meal logging.",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tag: "Balanced • High Accuracy",
    desc: "Great multimodal balance with rich visual food identification.",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tag: "Pro Reasoning",
    desc: "Deepest reasoning for complex plates with dozens of ingredients.",
  },
];

export function loadStoredModel(): string {
  try {
    return localStorage.getItem(CUSTOM_MODEL_STORAGE_KEY) || DEFAULT_GEMINI_MODEL;
  } catch {
    return DEFAULT_GEMINI_MODEL;
  }
}

export function saveStoredModel(modelId: string): void {
  try {
    localStorage.setItem(CUSTOM_MODEL_STORAGE_KEY, modelId);
  } catch (err) {
    console.error("Failed to save model choice to localStorage", err);
  }
}

// -------------------------------------------------------------
// SAVED COMBO MEALS (Custom multi-item meals for 1-tap fast logging)
// -------------------------------------------------------------
const SAVED_COMBOS_STORAGE_KEY = "night_cal_saved_combos_v1";

export const DEFAULT_SAVED_COMBOS: SavedMealCombo[] = [
  {
    id: "combo-roti-dal-dahi",
    name: "2 Roti + Dal + Dahi",
    mealType: "lunch",
    calories: 370,
    protein: 20.2,
    carbs: 51,
    fat: 9.5,
    isDefault: true,
    items: [
      { name: "Chapati / Roti", portion: "2 pcs", calories: 140, protein: 6.2, carbs: 29, fat: 0.8 },
      { name: "Yellow Dal (Tadka)", portion: "1 bowl", calories: 140, protein: 9.0, carbs: 16, fat: 4.2 },
      { name: "Curd / Dahi", portion: "1 bowl", calories: 90, protein: 5.0, carbs: 6, fat: 4.5 },
    ],
  },
  {
    id: "combo-whey-banana-shake",
    name: "Whey Shake + Banana + Almonds",
    mealType: "snack",
    calories: 375,
    protein: 34.3,
    carbs: 35,
    fat: 9.6,
    isDefault: true,
    items: [
      {
        name: "Whey Protein Shake",
        portion: "1 scoop",
        calories: 130,
        protein: 25.0,
        carbs: 3,
        fat: 1.5,
        ingredients: [
          { name: "Banana", portion: "1 pc", calories: 105, protein: 1.3 },
          { name: "Almonds", portion: "10 pcs", calories: 70, protein: 2.6 },
          { name: "Water / Ice", portion: "250ml", calories: 0, protein: 0 },
        ],
      },
    ],
  },
  {
    id: "combo-eggs-toast",
    name: "3 Boiled Eggs + 2 Roti / Toast",
    mealType: "breakfast",
    calories: 374,
    protein: 25.1,
    carbs: 30,
    fat: 15.2,
    isDefault: true,
    items: [
      { name: "Whole Egg (Boiled)", portion: "3 pcs", calories: 216, protein: 18.9, carbs: 1.2, fat: 14.4 },
      { name: "Chapati / Roti", portion: "2 pcs", calories: 140, protein: 6.2, carbs: 29, fat: 0.8 },
    ],
  },
  {
    id: "combo-paneer-bhurji-roti",
    name: "Paneer Bhurji + 2 Roti",
    mealType: "dinner",
    calories: 405,
    protein: 24.5,
    carbs: 35,
    fat: 18.8,
    isDefault: true,
    items: [
      { name: "Paneer Bhurji", portion: "1 bowl", calories: 265, protein: 18.3, carbs: 6, fat: 18.0 },
      { name: "Chapati / Roti", portion: "2 pcs", calories: 140, protein: 6.2, carbs: 29, fat: 0.8 },
    ],
  },
];

export function loadSavedMealCombos(): SavedMealCombo[] {
  try {
    const raw = localStorage.getItem(SAVED_COMBOS_STORAGE_KEY);
    if (!raw) return DEFAULT_SAVED_COMBOS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SAVED_COMBOS;
  } catch {
    return DEFAULT_SAVED_COMBOS;
  }
}

export function saveMealCombo(combo: SavedMealCombo): SavedMealCombo[] {
  const current = loadSavedMealCombos();
  const existingIdx = current.findIndex((c) => c.id === combo.id);
  let updated: SavedMealCombo[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = combo;
  } else {
    updated = [combo, ...current];
  }
  try {
    localStorage.setItem(SAVED_COMBOS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save meal combo", err);
  }
  return updated;
}

export function deleteMealCombo(id: string): SavedMealCombo[] {
  const current = loadSavedMealCombos();
  const updated = current.filter((c) => c.id !== id);
  try {
    localStorage.setItem(SAVED_COMBOS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to delete meal combo", err);
  }
  return updated;
}

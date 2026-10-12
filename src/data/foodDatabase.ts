import { FoodUnitType } from "../types";
import { loadStoredApiKey, loadStoredModel } from "../utils/storage";

export interface FoodItemDefinition {
  id: string;
  name: string;
  hindiName?: string;
  category: "nuts_seeds" | "fruits" | "cooked_dishes" | "staples" | "proteins" | "dairy" | "custom";
  defaultUnit: FoodUnitType | string;
  unitStep?: number;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
  aliases: string[];
  gramsPerUnit?: number; // Weight in grams of 1 defaultUnit
  mlPerUnit?: number; // Volume in ml of 1 defaultUnit for liquids
  isLiquid?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

export const INDIAN_FOOD_DATABASE: FoodItemDefinition[] = [
  // Nuts & Seeds
  {
    id: "almond",
    name: "Almond",
    hindiName: "Badam (बादाम)",
    category: "nuts_seeds",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 7,
    proteinPerUnit: 0.26,
    carbsPerUnit: 0.25,
    fatPerUnit: 0.6,
    gramsPerUnit: 1.2,
    aliases: ["almond", "badam", "badam giri", "raw almond", "soaked almond"],
  },
  {
    id: "peanut",
    name: "Peanut",
    hindiName: "Moongphali (मूँगफली)",
    category: "nuts_seeds",
    defaultUnit: "piece",
    unitStep: 5,
    caloriesPerUnit: 6,
    proteinPerUnit: 0.26,
    carbsPerUnit: 0.16,
    fatPerUnit: 0.5,
    gramsPerUnit: 0.8,
    aliases: ["peanut", "peanuts", "moongphali", "mungfali", "singdana", "groundnut"],
  },
  {
    id: "foxnut",
    name: "Foxnut",
    hindiName: "Makhana (मखाना)",
    category: "nuts_seeds",
    defaultUnit: "cup",
    unitStep: 0.5,
    caloriesPerUnit: 88,
    proteinPerUnit: 2.5,
    carbsPerUnit: 19,
    fatPerUnit: 0.2,
    gramsPerUnit: 25,
    aliases: ["foxnut", "fox nuts", "makhana", "roasted makhana", "phool makhana", "lotus seeds"],
  },
  {
    id: "cashew",
    name: "Cashew",
    hindiName: "Kaju (काजू)",
    category: "nuts_seeds",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 9,
    proteinPerUnit: 0.3,
    carbsPerUnit: 0.5,
    fatPerUnit: 0.7,
    gramsPerUnit: 1.5,
    aliases: ["cashew", "kaju", "cashews"],
  },
  {
    id: "walnut",
    name: "Walnut",
    hindiName: "Akhrot (अखरोट)",
    category: "nuts_seeds",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 26,
    proteinPerUnit: 0.6,
    carbsPerUnit: 0.6,
    fatPerUnit: 2.6,
    gramsPerUnit: 4.0,
    aliases: ["walnut", "akhrot", "walnuts"],
  },
  {
    id: "peanut_butter",
    name: "Peanut Butter",
    hindiName: "Peanut Butter (पीनट बटर)",
    category: "nuts_seeds",
    defaultUnit: "serving", // 1 tbsp (16g)
    unitStep: 1,
    caloriesPerUnit: 95,
    proteinPerUnit: 4.0,
    carbsPerUnit: 3.5,
    fatPerUnit: 8.0,
    gramsPerUnit: 16,
    aliases: ["peanut butter", "pb", "creamy peanut butter"],
  },
  {
    id: "chia_seeds",
    name: "Chia Seeds",
    hindiName: "Chia Seeds (चिया बीज)",
    category: "nuts_seeds",
    defaultUnit: "serving", // 1 tbsp (12g)
    unitStep: 1,
    caloriesPerUnit: 58,
    proteinPerUnit: 2.0,
    carbsPerUnit: 5.0,
    fatPerUnit: 3.5,
    gramsPerUnit: 12,
    aliases: ["chia", "chia seeds", "sabja"],
  },

  // Fruits
  {
    id: "banana",
    name: "Banana",
    hindiName: "Kela (केला)",
    category: "fruits",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 105,
    proteinPerUnit: 1.3,
    carbsPerUnit: 27,
    fatPerUnit: 0.3,
    gramsPerUnit: 118,
    aliases: ["banana", "kela", "ripe banana", "yellow banana"],
  },
  {
    id: "apple",
    name: "Apple",
    hindiName: "Seb (सेब)",
    category: "fruits",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 95,
    proteinPerUnit: 0.5,
    carbsPerUnit: 25,
    fatPerUnit: 0.3,
    gramsPerUnit: 180,
    aliases: ["apple", "seb", "red apple", "green apple"],
  },

  // Staples & Breads
  {
    id: "chapati",
    name: "Chapati / Roti",
    hindiName: "Phulka / Roti (रोटी)",
    category: "staples",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 104,
    proteinPerUnit: 3.1,
    carbsPerUnit: 20,
    fatPerUnit: 0.5,
    gramsPerUnit: 40,
    aliases: ["chapati", "roti", "phulka", "fulka", "wheat roti", "atta roti"],
  },
  {
    id: "steamed_rice",
    name: "Steamed Rice",
    hindiName: "Chawal (चावल)",
    category: "staples",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 195,
    proteinPerUnit: 4.0,
    carbsPerUnit: 44,
    fatPerUnit: 0.5,
    gramsPerUnit: 150,
    aliases: ["rice", "steamed rice", "chawal", "white rice", "basmati rice", "boiled rice"],
  },
  {
    id: "oats",
    name: "Oatmeal / Oats",
    hindiName: "Jowar / Oats (ओट्स)",
    category: "staples",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 152,
    proteinPerUnit: 5.4,
    carbsPerUnit: 27,
    fatPerUnit: 2.6,
    gramsPerUnit: 40,
    aliases: ["oats", "oatmeal", "rolled oats", "masala oats"],
  },
  {
    id: "poha",
    name: "Poha",
    hindiName: "Flattened Rice (पोहा)",
    category: "staples",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 220,
    proteinPerUnit: 4.5,
    carbsPerUnit: 42,
    fatPerUnit: 4.0,
    gramsPerUnit: 150,
    aliases: ["poha", "pohe", "kanda poha", "flattened rice", "batata poha"],
  },
  {
    id: "idli",
    name: "Idli",
    hindiName: "Steamed Idli (इडली)",
    category: "staples",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 55,
    proteinPerUnit: 2.0,
    carbsPerUnit: 12,
    fatPerUnit: 0.2,
    gramsPerUnit: 50,
    aliases: ["idli", "idly", "steamed idli", "rice idli"],
  },
  {
    id: "dosa",
    name: "Plain Dosa",
    hindiName: "Dosa (डोसा)",
    category: "staples",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 135,
    proteinPerUnit: 3.0,
    carbsPerUnit: 22,
    fatPerUnit: 4.0,
    gramsPerUnit: 80,
    aliases: ["dosa", "plain dosa", "sada dosa", "crispy dosa"],
  },
  {
    id: "paratha_plain",
    name: "Plain Paratha",
    hindiName: "Paratha (पराठा)",
    category: "staples",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 220,
    proteinPerUnit: 4.0,
    carbsPerUnit: 32,
    fatPerUnit: 9.0,
    gramsPerUnit: 80,
    aliases: ["paratha", "plain paratha", "tawa paratha", "laccha paratha"],
  },
  {
    id: "paratha_aloo",
    name: "Aloo Paratha",
    hindiName: "Aloo Paratha (आलू पराठा)",
    category: "staples",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 280,
    proteinPerUnit: 5.0,
    carbsPerUnit: 42,
    fatPerUnit: 11.0,
    gramsPerUnit: 120,
    aliases: ["aloo paratha", "potato paratha", "alu paratha"],
  },

  // Cooked Vegetables & Curries
  {
    id: "chole",
    name: "Chole (Chickpea Curry)",
    hindiName: "Chole / Chana Masala (छोले)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 210,
    proteinPerUnit: 7.5,
    carbsPerUnit: 28,
    fatPerUnit: 7.0,
    gramsPerUnit: 150,
    aliases: ["chole", "chana masala", "white chana", "kabuli chana curry", "channa"],
  },
  {
    id: "chana_boiled",
    name: "Boiled Chana / Kala Chana",
    hindiName: "Kala Chana (काला चना)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 164,
    proteinPerUnit: 8.9,
    carbsPerUnit: 27,
    fatPerUnit: 2.6,
    gramsPerUnit: 100,
    aliases: ["chana", "boiled chana", "kala chana", "black chana", "chickpeas", "boiled black chickpeas"],
  },
  {
    id: "bitter_gourd",
    name: "Bitter Gourd Sabzi (Karela)",
    hindiName: "Karela Sabzi (करेला)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 65,
    proteinPerUnit: 1.8,
    carbsPerUnit: 6.0,
    fatPerUnit: 4.0,
    gramsPerUnit: 100,
    aliases: ["karela", "bitter gourd", "butter gaurd", "karela sabzi", "karela fry", "bitter melon"],
  },
  {
    id: "bhindi",
    name: "Bhindi Sabzi (Okra)",
    hindiName: "Bhindi Masala (भिंडी)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 80,
    proteinPerUnit: 2.0,
    carbsPerUnit: 8.0,
    fatPerUnit: 5.0,
    gramsPerUnit: 100,
    aliases: ["bhindi", "bhendi", "okra", "lady finger", "bhindi fry", "bhindi sabzi"],
  },
  {
    id: "potato_sabzi",
    name: "Potato / Aloo Sabzi",
    hindiName: "Aloo Sabzi (आलू की सब्ज़ी)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 150,
    proteinPerUnit: 2.5,
    carbsPerUnit: 22,
    fatPerUnit: 6.0,
    gramsPerUnit: 120,
    aliases: ["potato", "aloo", "alu", "potato sabzi", "aloo fry", "jeera aloo"],
  },
  {
    id: "boiled_potato",
    name: "Boiled Potato (Plain)",
    hindiName: "Ubla Aloo (उबला आलू)",
    category: "staples",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 130,
    proteinPerUnit: 3.0,
    carbsPerUnit: 30,
    fatPerUnit: 0.2,
    gramsPerUnit: 150,
    aliases: ["boiled potato", "plain potato", "ubla aloo", "boiled aloo"],
  },
  {
    id: "yellow_dal",
    name: "Yellow Dal (Toor / Moong)",
    hindiName: "Dal Tadka / Fry (दाल)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 130,
    proteinPerUnit: 7.5,
    carbsPerUnit: 20,
    fatPerUnit: 2.5,
    gramsPerUnit: 150,
    isLiquid: true,
    mlPerUnit: 150,
    aliases: ["dal", "daal", "toor dal", "moong dal", "yellow dal", "dal tadka", "dal fry"],
  },
  {
    id: "rajma",
    name: "Rajma (Kidney Beans Curry)",
    hindiName: "Rajma Masala (राजमा)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 180,
    proteinPerUnit: 8.0,
    carbsPerUnit: 24,
    fatPerUnit: 4.0,
    gramsPerUnit: 150,
    aliases: ["rajma", "kidney beans", "rajma masala", "rajmah"],
  },
  {
    id: "paneer_curry",
    name: "Paneer Sabzi / Matar Paneer",
    hindiName: "Paneer (पनीर सब्ज़ी)",
    category: "cooked_dishes",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 230,
    proteinPerUnit: 11.0,
    carbsPerUnit: 9.0,
    fatPerUnit: 16.0,
    gramsPerUnit: 150,
    aliases: ["paneer sabzi", "matar paneer", "paneer butter masala", "paneer bhurji", "shahi paneer"],
  },
  {
    id: "raw_paneer",
    name: "Raw Paneer (Cottage Cheese)",
    hindiName: "Kaccha Paneer (कच्चा पनीर)",
    category: "proteins",
    defaultUnit: "gram",
    unitStep: 25,
    caloriesPerUnit: 2.64, // per 1g (so 50g = 132 kcal, 100g = 264 kcal)
    proteinPerUnit: 0.182, // 18.2g P per 100g
    carbsPerUnit: 0.034,
    fatPerUnit: 0.208,
    gramsPerUnit: 1,
    aliases: ["raw paneer", "paneer slice", "cottage cheese", "fresh paneer"],
  },

  // High Protein & Fitness Foods
  {
    id: "protein_shake",
    name: "Protein Shake (Whey)",
    hindiName: "Whey Protein (प्रोटीन शेक)",
    category: "proteins",
    defaultUnit: "scoop",
    unitStep: 1,
    caloriesPerUnit: 120,
    proteinPerUnit: 24.0,
    carbsPerUnit: 3.0,
    fatPerUnit: 1.5,
    gramsPerUnit: 30,
    mlPerUnit: 300,
    isLiquid: true,
    aliases: ["protein shake", "whey", "whey protein", "isolate", "protein powder", "shake"],
  },
  {
    id: "soya_chunks",
    name: "Soya Chunks (Cooked)",
    hindiName: "Nutrela Soya (सोया चंक्स)",
    category: "proteins",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 138,
    proteinPerUnit: 20.8,
    carbsPerUnit: 13.0,
    fatPerUnit: 0.2,
    gramsPerUnit: 120,
    aliases: ["soya chunks", "nutrela", "soya badi", "soya nuggets", "soy chunks", "soya curry"],
  },
  {
    id: "boiled_egg",
    name: "Boiled Egg (Whole)",
    hindiName: "Ubla Anda (उबला अंडा)",
    category: "proteins",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 72,
    proteinPerUnit: 6.3,
    carbsPerUnit: 0.4,
    fatPerUnit: 4.8,
    gramsPerUnit: 50,
    aliases: ["egg", "boiled egg", "anda", "whole egg", "boiled anda", "hard boiled egg"],
  },
  {
    id: "egg_white",
    name: "Egg White (Boiled)",
    hindiName: "Anda Safedi (अंडे की सफेदी)",
    category: "proteins",
    defaultUnit: "piece",
    unitStep: 1,
    caloriesPerUnit: 17,
    proteinPerUnit: 3.6,
    carbsPerUnit: 0.2,
    fatPerUnit: 0.1,
    gramsPerUnit: 33,
    aliases: ["egg white", "egg whites", "anda safedi", "boiled egg white"],
  },
  {
    id: "chicken_breast",
    name: "Chicken Breast (Cooked)",
    hindiName: "Chicken Breast (चिकन ब्रेस्ट)",
    category: "proteins",
    defaultUnit: "gram",
    unitStep: 25,
    caloriesPerUnit: 1.65, // per 1g (so 100g = 165 kcal)
    proteinPerUnit: 0.31, // 31g P per 100g
    carbsPerUnit: 0.0,
    fatPerUnit: 0.036,
    gramsPerUnit: 1,
    aliases: ["chicken", "chicken breast", "boiled chicken", "grilled chicken", "roasted chicken"],
  },

  // Dairy & Drinks
  {
    id: "curd",
    name: "Curd / Dahi",
    hindiName: "Dahi (दही)",
    category: "dairy",
    defaultUnit: "bowl",
    unitStep: 0.5,
    caloriesPerUnit: 90,
    proteinPerUnit: 5.0,
    carbsPerUnit: 6.0,
    fatPerUnit: 4.5,
    gramsPerUnit: 150,
    mlPerUnit: 150,
    isLiquid: true,
    aliases: ["curd", "dahi", "plain dahi", "yogurt", "greek yogurt"],
  },
  {
    id: "milk",
    name: "Milk (Toned)",
    hindiName: "Doodh (दूध)",
    category: "dairy",
    defaultUnit: "cup",
    unitStep: 0.5,
    caloriesPerUnit: 150,
    proteinPerUnit: 8.0,
    carbsPerUnit: 12.0,
    fatPerUnit: 7.5,
    gramsPerUnit: 250,
    mlPerUnit: 250,
    isLiquid: true,
    aliases: ["milk", "doodh", "cow milk", "toned milk", "glass of milk"],
  },
];

const CUSTOM_FOODS_STORAGE_KEY = "night_cal_custom_foods_v1";

/**
 * Loads user created custom food items from localStorage.
 */
export function loadCustomFoods(): FoodItemDefinition[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves a new custom food item.
 */
export function saveCustomFood(
  item: Omit<FoodItemDefinition, "id" | "isCustom"> & { id?: string }
): FoodItemDefinition {
  const customList = loadCustomFoods();
  const id = item.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const fullItem: FoodItemDefinition = {
    ...item,
    id,
    isCustom: true,
    aliases: item.aliases || [item.name.toLowerCase()],
    createdAt: new Date().toISOString(),
  };

  const filtered = customList.filter((f) => f.id !== id);
  filtered.unshift(fullItem);

  try {
    localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to save custom food to localStorage", err);
  }

  return fullItem;
}

/**
 * Deletes a custom food item by ID.
 */
export function deleteCustomFood(id: string): void {
  try {
    const customList = loadCustomFoods();
    const filtered = customList.filter((f) => f.id !== id);
    localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete custom food", err);
  }
}

/**
 * Updates an existing custom food item.
 */
export function updateCustomFood(
  id: string,
  updates: Partial<Omit<FoodItemDefinition, "id">>
): FoodItemDefinition | null {
  const customList = loadCustomFoods();
  const existingIndex = customList.findIndex((f) => f.id === id);
  if (existingIndex === -1) return null;

  const updated: FoodItemDefinition = {
    ...customList[existingIndex],
    ...updates,
    id,
    isCustom: true,
  };

  customList[existingIndex] = updated;

  try {
    localStorage.setItem(CUSTOM_FOODS_STORAGE_KEY, JSON.stringify(customList));
  } catch (err) {
    console.error("Failed to update custom food", err);
  }

  return updated;
}

/**
 * Fetches verified nutrition details for any food or dish from AI and web.
 */
export async function fetchFoodNutritionFromAPI(
  foodName: string,
  requestedUnit?: string
): Promise<{
  name: string;
  hindiName?: string;
  category?: string;
  defaultUnit: FoodUnitType | string;
  caloriesPerUnit: number;
  proteinPerUnit: number;
  carbsPerUnit: number;
  fatPerUnit: number;
  gramsPerUnit?: number;
  portionExplanation?: string;
} | null> {
  const customKey = loadStoredApiKey();
  const customModel = loadStoredModel();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (customKey) headers["x-gemini-api-key"] = customKey;
  if (customModel) headers["x-gemini-model"] = customModel;

  const res = await fetch("/api/fetch-food-nutrition", {
    method: "POST",
    headers,
    body: JSON.stringify({ foodName, requestedUnit }),
  });

  if (!res.ok) {
    throw new Error("API call failed to fetch nutrient details");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Retrieves all food items (standard Indian database + user custom foods).
 */
export function getAllFoodItems(): FoodItemDefinition[] {
  const customList = loadCustomFoods();
  return [...customList, ...INDIAN_FOOD_DATABASE];
}

/**
 * Searches the unified food database (Indian + Custom foods).
 */
export function searchFoodItems(query: string): FoodItemDefinition[] {
  const all = getAllFoodItems();
  const clean = query.trim().toLowerCase();
  if (!clean) return all.slice(0, 14);

  return all.filter((item) => {
    if (item.name.toLowerCase().includes(clean)) return true;
    if (item.hindiName?.toLowerCase().includes(clean)) return true;
    return item.aliases.some((alias) => alias.toLowerCase().includes(clean));
  });
}

/**
 * Calculates accurate nutrients for any food item based on chosen quantity and unit.
 * Supports "piece", "gram", "litre", "ml", "bowl", "cup", "scoop", "serving".
 */
export function calculateFoodNutrients(
  food: FoodItemDefinition,
  quantity: number,
  unit: FoodUnitType | string
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portionLabel: string;
} {
  const q = Math.max(0.01, quantity);
  const baseCal = food.caloriesPerUnit;
  const basePro = food.proteinPerUnit;
  const baseCarb = food.carbsPerUnit;
  const baseFat = food.fatPerUnit;
  const defUnit = food.defaultUnit;
  const gramsPerUnit = food.gramsPerUnit || 50;
  const mlPerUnit = food.mlPerUnit || gramsPerUnit || 250;

  let multiplier = 1;

  if (unit === defUnit) {
    multiplier = q;
  } else if (unit === "gram") {
    // If defUnit was "gram", multiplier is q
    if (defUnit === "gram") {
      multiplier = q;
    } else {
      // 1 defUnit weighs gramsPerUnit grams
      multiplier = q / gramsPerUnit;
    }
  } else if (unit === "piece") {
    if (defUnit === "piece") {
      multiplier = q;
    } else if (defUnit === "gram") {
      multiplier = q * gramsPerUnit;
    } else {
      multiplier = q;
    }
  } else if (unit === "litre") {
    // 1 litre = 1000 ml
    const totalMl = q * 1000;
    if (defUnit === "gram") {
      // 1ml ~ 1g approx
      multiplier = totalMl;
    } else {
      multiplier = totalMl / mlPerUnit;
    }
  } else if (unit === "ml") {
    if (defUnit === "gram") {
      multiplier = q;
    } else {
      multiplier = q / mlPerUnit;
    }
  } else if (unit === "bowl") {
    // 1 bowl approx 150g
    if (defUnit === "bowl") {
      multiplier = q;
    } else if (defUnit === "gram") {
      multiplier = q * 150;
    } else {
      multiplier = (q * 150) / gramsPerUnit;
    }
  } else if (unit === "cup") {
    // 1 cup approx 200g / 250ml
    if (defUnit === "cup") {
      multiplier = q;
    } else if (defUnit === "gram") {
      multiplier = q * 200;
    } else {
      multiplier = (q * 200) / gramsPerUnit;
    }
  } else if (unit === "scoop") {
    // 1 scoop approx 30g
    if (defUnit === "scoop") {
      multiplier = q;
    } else if (defUnit === "gram") {
      multiplier = q * 30;
    } else {
      multiplier = (q * 30) / gramsPerUnit;
    }
  } else {
    // Default fallback
    multiplier = q;
  }

  // Format portion display nicely
  let portionLabel = `${q} ${unit}`;
  if (unit === "litre") {
    portionLabel = `${q} L (${q * 1000} ml)`;
  } else if (unit === "gram") {
    portionLabel = `${q}g`;
  } else if (unit === "piece") {
    portionLabel = `${q} ${q === 1 ? "pc" : "pcs"}`;
  }

  return {
    calories: Math.max(0, Math.round(baseCal * multiplier)),
    protein: Math.max(0, Math.round(basePro * multiplier * 10) / 10),
    carbs: Math.max(0, Math.round(baseCarb * multiplier * 10) / 10),
    fat: Math.max(0, Math.round(baseFat * multiplier * 10) / 10),
    portionLabel,
  };
}

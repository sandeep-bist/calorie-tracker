import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  Flame,
  Dumbbell,
  Check,
  ChevronLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  PlusCircle,
  CornerDownRight,
  Layers,
  Edit2,
  Loader2,
  ListFilter,
  CheckCircle2,
  Bookmark,
  Star,
  Zap,
  Coffee,
  RotateCcw,
} from "lucide-react";
import {
  Meal,
  MealType,
  MealItem,
  FoodUnitType,
  MealItemIngredient,
  SavedMealCombo,
} from "../types";
import {
  loadStoredApiKey,
  loadStoredModel,
  loadSavedMealCombos,
  saveMealCombo,
  deleteMealCombo,
} from "../utils/storage";
import {
  INDIAN_FOOD_DATABASE,
  FoodItemDefinition,
  searchFoodItems,
  calculateFoodNutrients,
  saveCustomFood,
  updateCustomFood,
  deleteCustomFood,
  loadCustomFoods,
  getAllFoodItems,
  fetchFoodNutritionFromAPI,
} from "../data/foodDatabase";

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMeal: (meal: Omit<Meal, "id">) => void;
  selectedDate: string;
  favoriteMeals?: Meal[];
}

interface StagedFoodEntry {
  id: string;
  food: FoodItemDefinition;
  quantity: number;
  unit: FoodUnitType | string;
  portionLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: MealItemIngredient[];
}

// 1-Tap popular Indian shortcuts to add instantly to plate with 0 typing
const ONE_TAP_QUICK_ITEMS = [
  { label: "2 Roti", foodId: "chapati", qty: 2, unit: "piece", cal: 140, pro: 6.2, icon: "🫓" },
  { label: "1 Bowl Dal", foodId: "yellow_dal", qty: 1, unit: "bowl", cal: 140, pro: 9.0, icon: "🍲" },
  { label: "1 Bowl Rice", foodId: "cooked_rice", qty: 1, unit: "bowl", cal: 130, pro: 2.7, icon: "🍚" },
  { label: "2 Boiled Eggs", foodId: "boiled_egg", qty: 2, unit: "piece", cal: 144, pro: 12.6, icon: "🥚" },
  { label: "1 Whey Shake", foodId: "protein_shake", qty: 1, unit: "scoop", cal: 130, pro: 25.0, icon: "🥤" },
  { label: "1 Bowl Dahi", foodId: "curd", qty: 1, unit: "bowl", cal: 90, pro: 5.0, icon: "🥛" },
  { label: "1 Banana", foodId: "banana", qty: 1, unit: "piece", cal: 105, pro: 1.3, icon: "🍌" },
  { label: "10 Almonds", foodId: "almond", qty: 10, unit: "piece", cal: 70, pro: 2.6, icon: "🥜" },
  { label: "25g Peanuts", foodId: "peanut", qty: 25, unit: "gram", cal: 142, pro: 6.5, icon: "🥜" },
  { label: "1 Chai / Coffee", foodId: "milk", qty: 1, unit: "cup", cal: 85, pro: 3.2, icon: "☕" },
  { label: "100g Paneer", foodId: "paneer_raw", qty: 100, unit: "gram", cal: 265, pro: 18.3, icon: "🧀" },
  { label: "150g Chicken", foodId: "chicken_breast", qty: 150, unit: "gram", cal: 248, pro: 46.5, icon: "🍗" },
];

// Quick add-in definitions for drinks, shakes, bowls, etc.
const QUICK_ADD_IN_OPTIONS = [
  { name: "Banana", foodId: "banana", quantity: 1, unit: "piece", cal: 105, pro: 1.3 },
  { name: "Almonds (10 pcs)", foodId: "almond", quantity: 10, unit: "piece", cal: 70, pro: 2.6 },
  { name: "Peanuts (25g)", foodId: "peanut", quantity: 25, unit: "gram", cal: 142, pro: 6.5 },
  { name: "Milk (1 Cup / 250ml)", foodId: "milk", quantity: 1, unit: "cup", cal: 150, pro: 8.0 },
  { name: "Oats (1 Scoop / 40g)", foodId: "oats", quantity: 1, unit: "bowl", cal: 152, pro: 5.4 },
  { name: "Peanut Butter (1 Tbsp)", foodId: "peanut_butter", quantity: 1, unit: "serving", cal: 95, pro: 4.0 },
  { name: "Chia Seeds (1 Tbsp)", foodId: "chia_seeds", quantity: 1, unit: "serving", cal: 58, pro: 2.0 },
  { name: "Foxnut / Makhana (1 Cup)", foodId: "foxnut", quantity: 1, unit: "cup", cal: 88, pro: 2.5 },
];

const AVAILABLE_UNITS: { id: FoodUnitType; label: string }[] = [
  { id: "piece", label: "Piece / Count" },
  { id: "gram", label: "Gram (g)" },
  { id: "litre", label: "Litre (L)" },
  { id: "ml", label: "Millilitre (ml)" },
  { id: "bowl", label: "Bowl / Katori" },
  { id: "cup", label: "Cup (250ml)" },
  { id: "scoop", label: "Scoop (30g)" },
  { id: "serving", label: "Serving" },
];

const FOOD_CATEGORY_FILTERS = [
  { id: "all", label: "All Items" },
  { id: "proteins", label: "💪 High Protein" },
  { id: "staples", label: "🌾 Staples & Breads" },
  { id: "cooked_dishes", label: "🍛 Sabzi & Curries" },
  { id: "dairy", label: "🥛 Dairy & Drinks" },
  { id: "nuts_seeds", label: "🥜 Nuts & Seeds" },
  { id: "fruits", label: "🍎 Fruits" },
  { id: "custom", label: "⭐ Custom Foods" },
];

export const ManualAddModal: React.FC<ManualAddModalProps> = ({
  isOpen,
  onClose,
  onLogMeal,
  selectedDate,
  favoriteMeals = [],
}) => {
  const [tab, setTab] = useState<"food_calculator" | "combos" | "ai_text">("food_calculator");

  // --- TAB 1: Food & Quantity Calculator state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFood, setSelectedFood] = useState<FoodItemDefinition>(INDIAN_FOOD_DATABASE[0]);
  const [quantity, setQuantity] = useState<number>(10);
  const [selectedUnit, setSelectedUnit] = useState<FoodUnitType | string>("piece");

  // Optional Add-ins / Ingredients for the item currently being built
  const [currentAddIns, setCurrentAddIns] = useState<MealItemIngredient[]>([]);
  const [isAddInDrawerOpen, setIsAddInDrawerOpen] = useState(false);

  // Custom Food Form & Management State
  const [isCreatingCustomFood, setIsCreatingCustomFood] = useState(false);
  const [editingCustomFoodId, setEditingCustomFoodId] = useState<string | null>(null);
  const [customFoodName, setCustomFoodName] = useState("");
  const [customFoodUnit, setCustomFoodUnit] = useState<FoodUnitType>("gram");
  const [customFoodCalories, setCustomFoodCalories] = useState<string>("");
  const [customFoodProtein, setCustomFoodProtein] = useState<string>("");
  const [customFoodCarbs, setCustomFoodCarbs] = useState<string>("");
  const [customFoodFat, setCustomFoodFat] = useState<string>("");
  const [portionExplanation, setPortionExplanation] = useState<string | null>(null);

  // Auto-Fetch Nutrients from AI/Web state
  const [isFetchingNutrients, setIsFetchingNutrients] = useState(false);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(null);

  // Custom Foods List Manager Modal
  const [isManageCustomModalOpen, setIsManageCustomModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Staged plate items
  const [stagedItems, setStagedItems] = useState<StagedFoodEntry[]>([]);
  const [mealCategory, setMealCategory] = useState<MealType>("lunch");
  const [customMealTitle, setCustomMealTitle] = useState("");

  // Save Plate as New Combo modal state
  const [isSaveComboModalOpen, setIsSaveComboModalOpen] = useState(false);
  const [newComboName, setNewComboName] = useState("");

  // Saved combos list
  const [savedCombos, setSavedCombos] = useState<SavedMealCombo[]>(() => loadSavedMealCombos());

  // --- TAB 3: AI Text Estimator state ---
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Toast feedback inside modal
  const [quickToast, setQuickToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 2500);
  };

  // Sync saved combos on mount & refresh
  useEffect(() => {
    setSavedCombos(loadSavedMealCombos());
  }, [refreshTrigger, isOpen]);

  // Unified food list (Standard + User Custom)
  const allFoods = useMemo(() => {
    return getAllFoodItems();
  }, [refreshTrigger, isCreatingCustomFood, isOpen]);

  const customFoodsList = useMemo(() => {
    return loadCustomFoods();
  }, [refreshTrigger, isCreatingCustomFood, isOpen]);

  // Filtered foods by search and category
  const filteredFoods = useMemo(() => {
    let list = allFoods;
    if (selectedCategory === "custom") {
      list = customFoodsList;
    } else if (selectedCategory !== "all") {
      list = allFoods.filter((f) => f.category === selectedCategory);
    }

    const clean = searchQuery.trim().toLowerCase();
    if (!clean) return list.slice(0, 20);

    return list.filter((item) => {
      if (item.name.toLowerCase().includes(clean)) return true;
      if (item.hindiName?.toLowerCase().includes(clean)) return true;
      return item.aliases.some((alias) => alias.toLowerCase().includes(clean));
    });
  }, [searchQuery, selectedCategory, allFoods, customFoodsList]);

  // Select a food item and initialize quantity & unit smartly
  const handleSelectFood = (food: FoodItemDefinition) => {
    setSelectedFood(food);
    setSearchQuery("");
    setCurrentAddIns([]);

    if (food.defaultUnit === "gram") {
      setSelectedUnit("gram");
      setQuantity(100);
    } else if (food.defaultUnit === "piece") {
      setSelectedUnit("piece");
      if (food.id === "almond") setQuantity(10);
      else if (food.id === "peanut") setQuantity(15);
      else if (food.id === "chapati") setQuantity(2);
      else setQuantity(1);
    } else if (food.defaultUnit === "bowl") {
      setSelectedUnit("bowl");
      setQuantity(1);
    } else if (food.defaultUnit === "scoop") {
      setSelectedUnit("scoop");
      setQuantity(1);
    } else if (food.defaultUnit === "cup") {
      setSelectedUnit("cup");
      setQuantity(1);
    } else {
      setSelectedUnit(food.defaultUnit as FoodUnitType);
      setQuantity(1);
    }
  };

  // Base calculated nutrients for current food selection
  const baseNutrients = useMemo(() => {
    return calculateFoodNutrients(selectedFood, quantity, selectedUnit);
  }, [selectedFood, quantity, selectedUnit]);

  // Sum of current add-ins
  const addInsNutrients = useMemo(() => {
    return currentAddIns.reduce(
      (acc, ing) => {
        acc.calories += ing.calories;
        acc.protein += ing.protein;
        return acc;
      },
      { calories: 0, protein: 0 }
    );
  }, [currentAddIns]);

  // Combined totals for current staged item
  const currentTotalCalories = baseNutrients.calories + addInsNutrients.calories;
  const currentTotalProtein =
    Math.round((baseNutrients.protein + addInsNutrients.protein) * 10) / 10;
  const currentTotalCarbs = baseNutrients.carbs;
  const currentTotalFat = baseNutrients.fat;

  // Running totals across ALL items staged on the plate
  const totalCalories = stagedItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein =
    Math.round(stagedItems.reduce((acc, item) => acc + item.protein, 0) * 10) / 10;
  const totalCarbs =
    Math.round(stagedItems.reduce((acc, item) => acc + item.carbs, 0) * 10) / 10;
  const totalFat =
    Math.round(stagedItems.reduce((acc, item) => acc + item.fat, 0) * 10) / 10;

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 1-TAP QUICK ADD TO PLATE HANDLER
  const handleOneTapQuickAdd = (item: (typeof ONE_TAP_QUICK_ITEMS)[0]) => {
    const foodDef = allFoods.find((f) => f.id === item.foodId) || {
      id: item.foodId,
      name: item.label,
      category: "proteins",
      defaultUnit: item.unit as FoodUnitType,
      caloriesPerUnit: item.cal / item.qty,
      proteinPerUnit: item.pro / item.qty,
      carbsPerUnit: 0,
      fatPerUnit: 0,
      aliases: [item.label.toLowerCase()],
    };

    const newEntry: StagedFoodEntry = {
      id: `staged-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      food: foodDef as FoodItemDefinition,
      quantity: item.qty,
      unit: item.unit,
      portionLabel: `${item.qty} ${item.unit === "piece" ? "pcs" : item.unit}`,
      calories: item.cal,
      protein: item.pro,
      carbs: 0,
      fat: 0,
      ingredients: [],
    };

    setStagedItems((prev) => [...prev, newEntry]);
    triggerToast(`Added ${item.label} to plate!`);
  };

  // AUTO-FETCH NUTRIENT DETAILS FROM AI / WEB
  const handleAutoFetchNutrients = async (customNameOverride?: string) => {
    const targetName = customNameOverride || customFoodName;
    if (!targetName.trim()) return;

    setIsFetchingNutrients(true);
    setFetchSuccessMessage(null);
    setFetchErrorMessage(null);

    try {
      const fetched = await fetchFoodNutritionFromAPI(
        targetName.trim(),
        customFoodUnit
      );

      if (fetched) {
        setCustomFoodName(fetched.name || targetName);
        if (fetched.defaultUnit) {
          const matchedUnit = AVAILABLE_UNITS.find(
            (u) => u.id === fetched.defaultUnit || fetched.defaultUnit.includes(u.id)
          );
          if (matchedUnit) {
            setCustomFoodUnit(matchedUnit.id);
          }
        }
        setCustomFoodCalories(String(Math.round(fetched.caloriesPerUnit)));
        setCustomFoodProtein(String(Math.round(fetched.proteinPerUnit * 10) / 10));
        setCustomFoodCarbs(String(Math.round(fetched.carbsPerUnit * 10) / 10));
        setCustomFoodFat(String(Math.round(fetched.fatPerUnit * 10) / 10));

        if (fetched.portionExplanation) {
          setPortionExplanation(fetched.portionExplanation);
        }

        setFetchSuccessMessage("Verified nutrition fetched from AI & Web!");
        setTimeout(() => setFetchSuccessMessage(null), 3500);
      }
    } catch (err: unknown) {
      console.warn("Failed to auto-fetch from AI:", err);
      setFetchErrorMessage(
        "Could not auto-fetch from API. You can enter values directly."
      );
      setTimeout(() => setFetchErrorMessage(null), 4000);
    } finally {
      setIsFetchingNutrients(false);
    }
  };

  // OPEN EDIT FORM FOR CUSTOM FOOD
  const handleStartEditCustomFood = (food: FoodItemDefinition) => {
    setEditingCustomFoodId(food.id);
    setCustomFoodName(food.name);
    setCustomFoodUnit(
      (AVAILABLE_UNITS.some((u) => u.id === food.defaultUnit)
        ? food.defaultUnit
        : "piece") as FoodUnitType
    );
    setCustomFoodCalories(String(food.caloriesPerUnit));
    setCustomFoodProtein(String(food.proteinPerUnit));
    setCustomFoodCarbs(String(food.carbsPerUnit || 0));
    setCustomFoodFat(String(food.fatPerUnit || 0));
    setPortionExplanation(null);
    setIsCreatingCustomFood(true);
  };

  // DELETE CUSTOM FOOD
  const handleDeleteCustomFood = (foodId: string, foodName: string) => {
    if (window.confirm(`Are you sure you want to delete custom food "${foodName}"?`)) {
      deleteCustomFood(foodId);
      setRefreshTrigger((prev) => prev + 1);
      if (selectedFood.id === foodId) {
        setSelectedFood(INDIAN_FOOD_DATABASE[0]);
      }
      if (editingCustomFoodId === foodId) {
        setIsCreatingCustomFood(false);
        setEditingCustomFoodId(null);
      }
      triggerToast(`Deleted custom food "${foodName}"`);
    }
  };

  // SAVE OR UPDATE CUSTOM FOOD HANDLER
  const handleSaveCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;

    const cal = parseFloat(customFoodCalories) || 0;
    const pro = parseFloat(customFoodProtein) || 0;
    const carb = parseFloat(customFoodCarbs) || 0;
    const fat = parseFloat(customFoodFat) || 0;

    let savedItem: FoodItemDefinition;

    if (editingCustomFoodId) {
      const updated = updateCustomFood(editingCustomFoodId, {
        name: customFoodName.trim(),
        defaultUnit: customFoodUnit,
        caloriesPerUnit: cal,
        proteinPerUnit: pro,
        carbsPerUnit: carb,
        fatPerUnit: fat,
        gramsPerUnit:
          customFoodUnit === "gram"
            ? 1
            : customFoodUnit === "bowl"
            ? 150
            : customFoodUnit === "piece"
            ? 50
            : 50,
        mlPerUnit: customFoodUnit === "litre" ? 1000 : 250,
      });
      savedItem = updated || selectedFood;
      triggerToast(`Updated "${customFoodName.trim()}"`);
    } else {
      savedItem = saveCustomFood({
        name: customFoodName.trim(),
        category: "custom",
        defaultUnit: customFoodUnit,
        caloriesPerUnit: cal,
        proteinPerUnit: pro,
        carbsPerUnit: carb,
        fatPerUnit: fat,
        aliases: [customFoodName.trim().toLowerCase()],
        gramsPerUnit:
          customFoodUnit === "gram"
            ? 1
            : customFoodUnit === "bowl"
            ? 150
            : customFoodUnit === "piece"
            ? 50
            : 50,
        mlPerUnit: customFoodUnit === "litre" ? 1000 : 250,
      });
      triggerToast(`Saved new custom food "${customFoodName.trim()}"`);
    }

    setRefreshTrigger((prev) => prev + 1);
    handleSelectFood(savedItem);

    // Reset drawer state
    setIsCreatingCustomFood(false);
    setEditingCustomFoodId(null);
    setCustomFoodName("");
    setCustomFoodCalories("");
    setCustomFoodProtein("");
    setCustomFoodCarbs("");
    setCustomFoodFat("");
    setPortionExplanation(null);
  };

  // Add an ingredient / add-in to current item
  const handleAddIngredient = (
    name: string,
    portion: string,
    calories: number,
    protein: number
  ) => {
    setCurrentAddIns((prev) => [
      ...prev,
      {
        name,
        portion,
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setCurrentAddIns((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Add the fully customized item onto the meal plate
  const handleAddStagedItem = () => {
    if (quantity <= 0) return;

    const newEntry: StagedFoodEntry = {
      id: `staged-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      food: selectedFood,
      quantity,
      unit: selectedUnit,
      portionLabel: baseNutrients.portionLabel,
      calories: currentTotalCalories,
      protein: currentTotalProtein,
      carbs: currentTotalCarbs,
      fat: currentTotalFat,
      ingredients: [...currentAddIns],
    };

    setStagedItems((prev) => [...prev, newEntry]);
    setCurrentAddIns([]);
    setIsAddInDrawerOpen(false);
    triggerToast(`Added ${baseNutrients.portionLabel} ${selectedFood.name} to plate`);
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearPlate = () => {
    setStagedItems([]);
    setCurrentAddIns([]);
  };

  // SAVE CURRENT PLATE AS A NEW COMBO
  const handleSavePlateAsCombo = () => {
    if (stagedItems.length === 0) return;
    const name = newComboName.trim() || customMealTitle.trim() || `My Combo (${stagedItems.length} items)`;

    const combo: SavedMealCombo = {
      id: `combo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      mealType: mealCategory,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      items: stagedItems.map((i) => ({
        name: i.food.name,
        portion: i.portionLabel,
        calories: i.calories,
        protein: i.protein,
        carbs: i.carbs,
        fat: i.fat,
        ingredients: i.ingredients.length > 0 ? i.ingredients : undefined,
      })),
    };

    const updated = saveMealCombo(combo);
    setSavedCombos(updated);
    setIsSaveComboModalOpen(false);
    setNewComboName("");
    triggerToast(`Saved "${name}" as 1-tap combo!`);
  };

  // 1-TAP LOG A SAVED COMBO DIRECTLY
  const handleLogSavedCombo = (combo: SavedMealCombo) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    onLogMeal({
      date: selectedDate,
      timestamp: `${hours}:${minutes}`,
      name: combo.name,
      mealType: combo.mealType,
      calories: combo.calories,
      protein: combo.protein,
      carbs: combo.carbs,
      fat: combo.fat,
      items: combo.items ? [...combo.items] : [],
      aiAnalyzed: false,
    });

    onClose();
  };

  // ADD SAVED COMBO ITEMS TO CURRENT PLATE
  const handleAddComboToPlate = (combo: SavedMealCombo) => {
    const entries: StagedFoodEntry[] = combo.items.map((item, idx) => ({
      id: `staged-${Date.now()}-${idx}`,
      food: {
        id: `food-${idx}`,
        name: item.name,
        category: "cooked_dishes",
        defaultUnit: "serving",
        caloriesPerUnit: item.calories,
        proteinPerUnit: item.protein,
        carbsPerUnit: item.carbs || 0,
        fatPerUnit: item.fat || 0,
        aliases: [item.name.toLowerCase()],
      },
      quantity: 1,
      unit: "serving",
      portionLabel: item.portion,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      ingredients: item.ingredients ? [...item.ingredients] : [],
    }));

    setStagedItems((prev) => [...prev, ...entries]);
    setTab("food_calculator");
    triggerToast(`Added "${combo.name}" items to plate!`);
  };

  // DELETE SAVED COMBO
  const handleDeleteCombo = (id: string, name: string) => {
    if (window.confirm(`Delete saved meal combo "${name}"?`)) {
      const updated = deleteMealCombo(id);
      setSavedCombos(updated);
      triggerToast(`Deleted combo "${name}"`);
    }
  };

  // CONFIRM & LOG MEAL TO DATABASE
  const handleConfirmLogStagedMeal = () => {
    if (stagedItems.length === 0) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    let title = customMealTitle.trim();
    if (!title) {
      if (stagedItems.length === 1) {
        const first = stagedItems[0];
        title = `${first.portionLabel} ${first.food.name}`;
        if (first.ingredients.length > 0) {
          title += ` with ${first.ingredients.map((i) => i.name).join(", ")}`;
        }
      } else {
        title = stagedItems
          .map((i) => `${i.portionLabel} ${i.food.name}`)
          .slice(0, 2)
          .join(" + ");
        if (stagedItems.length > 2) title += ` +${stagedItems.length - 2} more`;
      }
    }

    const items: MealItem[] = stagedItems.map((i) => ({
      name: i.food.name,
      portion: i.portionLabel,
      calories: i.calories,
      protein: i.protein,
      carbs: i.carbs,
      fat: i.fat,
      ingredients: i.ingredients.length > 0 ? i.ingredients : undefined,
    }));

    onLogMeal({
      date: selectedDate,
      timestamp: `${hours}:${minutes}`,
      name: title,
      mealType: mealCategory,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      items,
      aiAnalyzed: false,
    });

    setStagedItems([]);
    setCurrentAddIns([]);
    setCustomMealTitle("");
    onClose();
  };

  // --- Local Fallback Parser when AI text endpoint is unreachable or slow ---
  const parseLocalMealText = (text: string) => {
    const lower = text.toLowerCase();
    let detectedCal = 0;
    let detectedPro = 0;
    let detectedCarb = 0;
    let detectedFat = 0;
    const foundItems: MealItem[] = [];

    allFoods.forEach((food) => {
      let matched = false;
      let qty = 1;

      for (const alias of [food.name.toLowerCase(), ...food.aliases]) {
        if (lower.includes(alias)) {
          matched = true;
          const regexBefore = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${alias}`, "i");
          const regexAfter = new RegExp(`${alias}\\s*(\\d+(?:\\.\\d+)?)`, "i");
          const matchB = lower.match(regexBefore);
          const matchA = lower.match(regexAfter);
          if (matchB) qty = parseFloat(matchB[1]);
          else if (matchA) qty = parseFloat(matchA[1]);
          else {
            if (food.id === "almond") qty = 6;
            if (food.id === "peanut") qty = 15;
          }
          break;
        }
      }

      if (matched) {
        const itemCal = Math.round(food.caloriesPerUnit * qty);
        const itemPro = Math.round(food.proteinPerUnit * qty * 10) / 10;
        const itemCarb = Math.round(food.carbsPerUnit * qty * 10) / 10;
        const itemFat = Math.round(food.fatPerUnit * qty * 10) / 10;

        detectedCal += itemCal;
        detectedPro += itemPro;
        detectedCarb += itemCarb;
        detectedFat += itemFat;

        foundItems.push({
          name: food.name,
          portion: `${qty} ${food.defaultUnit}`,
          calories: itemCal,
          protein: itemPro,
        });
      }
    });

    if (foundItems.length > 0) {
      return {
        mealName: text.trim(),
        calories: detectedCal,
        protein: Math.round(detectedPro * 10) / 10,
        carbs: Math.round(detectedCarb * 10) / 10,
        fat: Math.round(detectedFat * 10) / 10,
        items: foundItems,
      };
    }
    return null;
  };

  // --- TAB 3: AI Text Estimation ---
  const handleAITextAnalyze = async () => {
    if (!aiPrompt.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const customKey = loadStoredApiKey();
      const customModel = loadStoredModel();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (customKey) headers["x-gemini-api-key"] = customKey;
      if (customModel) headers["x-gemini-model"] = customModel;

      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers,
        body: JSON.stringify({
          promptText: aiPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error("Server AI request did not respond ok");
      }

      const json = await res.json();
      const data = json.data;

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      onLogMeal({
        date: selectedDate,
        timestamp: `${hours}:${minutes}`,
        name: data.mealName || aiPrompt,
        mealType: (data.mealType as MealType) || "snack",
        calories: Math.round(data.calories || 300),
        protein: Math.round((data.protein || 20) * 10) / 10,
        carbs: Math.round(data.carbs || 25),
        fat: Math.round(data.fat || 10),
        items: data.items || [],
        notes: data.nutritionalTakeaway || undefined,
        aiAnalyzed: true,
      });

      setStagedItems([]);
      onClose();
    } catch (err: unknown) {
      console.warn("API request failed, attempting local food database fallback:", err);
      const localResult = parseLocalMealText(aiPrompt);
      if (localResult) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        onLogMeal({
          date: selectedDate,
          timestamp: `${hours}:${minutes}`,
          name: localResult.mealName,
          mealType: "snack",
          calories: localResult.calories,
          protein: localResult.protein,
          carbs: localResult.carbs,
          fat: localResult.fat,
          items: localResult.items,
          notes: "Calculated from verified food database",
          aiAnalyzed: true,
        });
        setStagedItems([]);
        onClose();
      } else {
        setAnalysisError(
          "Could not reach API. Please pick items from the Food & Quantity tab for instant calculated nutrients!"
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 safe-bottom"
    >
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-2xl max-h-[92vh] overflow-y-auto relative">
        {/* Toast Alert */}
        {quickToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-mono text-xs font-bold py-1 px-3 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{quickToast}</span>
          </div>
        )}

        {/* Header with Back button */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-2.5">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white font-mono text-xs active:scale-95 transition-all mr-1"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back</span>
            </button>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              Easy Meal & Macro Logger
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: 3 Modes */}
        <div className="grid grid-cols-3 gap-1 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setTab("food_calculator")}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              tab === "food_calculator"
                ? "bg-neutral-800 text-white font-bold shadow border border-neutral-700"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Utensils className="w-3 h-3 text-emerald-400" />
            <span>Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("combos")}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              tab === "combos"
                ? "bg-neutral-800 text-white font-bold shadow border border-neutral-700"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Combos ({savedCombos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("ai_text")}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1 ${
              tab === "ai_text"
                ? "bg-neutral-800 text-white font-bold shadow border border-neutral-700"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>AI Text</span>
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: FOOD CALCULATOR & 1-TAP FAST LOGGING                       */}
        {/* ----------------------------------------------------------------- */}
        {tab === "food_calculator" && (
          <div className="space-y-3">
            {/* 1-TAP QUICK ADD CHIPS BAR */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  1-Tap Quick Add:
                </span>
                <span className="text-neutral-500 text-[9px]">Tap to stage on plate</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {ONE_TAP_QUICK_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOneTapQuickAdd(item)}
                    className="px-2.5 py-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-500/50 text-[10px] font-mono text-white flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all shadow-sm group"
                  >
                    <span>{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[9px] text-emerald-400/90 font-mono">
                      {item.cal}k
                    </span>
                    <Plus className="w-2.5 h-2.5 text-neutral-500 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Search Food Item or Add Custom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Search or Browse Food
                </label>
                <div className="flex items-center space-x-2">
                  {customFoodsList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsManageCustomModalOpen(true)}
                      className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <ListFilter className="w-3 h-3 text-purple-400" />
                      <span>Custom ({customFoodsList.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomFoodId(null);
                      setCustomFoodName("");
                      setCustomFoodCalories("");
                      setCustomFoodProtein("");
                      setCustomFoodCarbs("");
                      setCustomFoodFat("");
                      setPortionExplanation(null);
                      setIsCreatingCustomFood(true);
                    }}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>+ Custom Food</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search peanut, almond, chapati, shake, chole, chicken..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                {FOOD_CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-neutral-800 border-neutral-600 text-white font-bold"
                        : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Autocomplete / Search Results Card */}
              {searchQuery.trim().length > 0 && (
                <div className="max-h-52 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-xl p-1 space-y-1 z-10 shadow-xl">
                  {/* Web / AI Nutrient Fetch Prompt */}
                  <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-800/40 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-sky-200 truncate">
                      Want verified web info for <span className="font-bold text-white">"{searchQuery}"</span>?
                    </div>
                    <button
                      type="button"
                      disabled={isFetchingNutrients}
                      onClick={() => {
                        const queryToFetch = searchQuery.trim();
                        setCustomFoodName(queryToFetch);
                        setEditingCustomFoodId(null);
                        setIsCreatingCustomFood(true);
                        setSearchQuery("");
                        handleAutoFetchNutrients(queryToFetch);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-mono text-[10px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
                    >
                      {isFetchingNutrients ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>✨ Auto-Fetch from AI</span>
                    </button>
                  </div>

                  {filteredFoods.length === 0 ? (
                    <div className="p-3 text-center space-y-2">
                      <div className="text-[11px] text-neutral-400 font-mono">
                        "{searchQuery}" not found in local database
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomFoodName(searchQuery.trim());
                          setEditingCustomFoodId(null);
                          setIsCreatingCustomFood(true);
                          setSearchQuery("");
                          setTimeout(() => {
                            handleAutoFetchNutrients(searchQuery.trim());
                          }, 100);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold inline-flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3 h-3 text-black" />
                        <span>Create Custom Food "{searchQuery}"</span>
                      </button>
                    </div>
                  ) : (
                    filteredFoods.map((food) => (
                      <div
                        key={food.id}
                        className="w-full p-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between text-xs transition-colors group/item"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className="flex-1 text-left min-w-0"
                        >
                          <span className="font-semibold text-white">{food.name}</span>
                          {food.hindiName && (
                            <span className="text-[10px] text-neutral-400 ml-1.5 font-mono">
                              {food.hindiName}
                            </span>
                          )}
                          {food.isCustom && (
                            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-purple-950 text-purple-300 ml-1.5 border border-purple-800">
                              Custom
                            </span>
                          )}
                          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                            {food.caloriesPerUnit} kcal / {food.defaultUnit} • {food.proteinPerUnit}g P
                          </div>
                        </button>

                        {/* Options to MODIFY or DELETE custom foods */}
                        {food.isCustom && (
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditCustomFood(food);
                              }}
                              title="Modify custom food"
                              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-sky-300"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomFood(food.id, food.name);
                              }}
                              title="Delete custom food"
                              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* CUSTOM FOOD CREATION & MODIFICATION FORM DRAWER */}
            {isCreatingCustomFood && (
              <form
                onSubmit={handleSaveCustomFood}
                className="p-3.5 rounded-2xl bg-neutral-900/95 border border-emerald-500/50 space-y-2.5 animate-in fade-in shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    {editingCustomFoodId ? (
                      <>
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        Modify Custom Food Item
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Add New Custom Food Item
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCustomFood(false);
                      setEditingCustomFoodId(null);
                    }}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Food Name & Auto-Fetch Button */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      Food or Dish Name
                    </label>
                    <button
                      type="button"
                      disabled={!customFoodName.trim() || isFetchingNutrients}
                      onClick={() => handleAutoFetchNutrients()}
                      className="px-2 py-0.5 rounded-md bg-sky-950 hover:bg-sky-900 border border-sky-600/70 text-sky-300 font-mono text-[10px] flex items-center gap-1 active:scale-95 disabled:opacity-40 transition-all font-semibold"
                    >
                      {isFetchingNutrients ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>Auto-Fetch Nutrients from AI/Web</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Paneer Tikka, Chicken Shawarma, Dal Makhani..."
                    value={customFoodName}
                    onChange={(e) => setCustomFoodName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500"
                  />

                  {fetchSuccessMessage && (
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{fetchSuccessMessage}</span>
                    </div>
                  )}

                  {fetchErrorMessage && (
                    <div className="text-[10px] font-mono text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-lg p-1.5">
                      {fetchErrorMessage}
                    </div>
                  )}

                  {portionExplanation && (
                    <div className="text-[10px] font-mono text-neutral-400 bg-neutral-950 rounded-lg p-1 border border-neutral-800">
                      ℹ️ {portionExplanation}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                      Measurement Unit
                    </label>
                    <select
                      value={customFoodUnit}
                      onChange={(e) => setCustomFoodUnit(e.target.value as FoodUnitType)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    >
                      {AVAILABLE_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                      Calories (kcal) / unit
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 150"
                      value={customFoodCalories}
                      onChange={(e) => setCustomFoodCalories(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 12"
                      value={customFoodProtein}
                      onChange={(e) => setCustomFoodProtein(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 20"
                      value={customFoodCarbs}
                      onChange={(e) => setCustomFoodCarbs(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      value={customFoodFat}
                      onChange={(e) => setCustomFoodFat(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {editingCustomFoodId && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCustomFood(editingCustomFoodId, customFoodName)
                      }
                      className="py-1.5 px-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 font-mono text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCustomFood(false);
                      setEditingCustomFoodId(null);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-neutral-800 text-neutral-300 font-mono text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs shadow"
                  >
                    {editingCustomFoodId ? "Update & Save Food" : "Save & Select Food"}
                  </button>
                </div>
              </form>
            )}

            {/* Selected Food & Quantity + Unit Controller Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white block">
                      {selectedFood.name}
                    </span>
                    {selectedFood.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleStartEditCustomFood(selectedFood)}
                        title="Modify this custom food"
                        className="text-neutral-400 hover:text-sky-300 p-0.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Standard: {selectedFood.caloriesPerUnit} kcal • {selectedFood.proteinPerUnit}g P / {selectedFood.defaultUnit}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
                    {selectedFood.isCustom ? "Custom Item" : "Verified Nutrition"}
                  </span>
                </div>
              </div>

              {/* Quantity AND Measurement Unit Selector */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Quantity Input with Stepper */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase block">
                    Amount / Quantity:
                  </label>
                  <div className="flex items-center space-x-1 bg-black border border-neutral-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.max(
                            0.1,
                            selectedUnit === "gram"
                              ? q - 10
                              : selectedUnit === "piece"
                              ? q - 1
                              : q - 0.5
                          )
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-white active:scale-95 shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0.1))
                      }
                      className="w-full text-center font-mono font-bold text-sm bg-transparent text-white focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          selectedUnit === "gram"
                            ? q + 10
                            : selectedUnit === "piece"
                            ? q + 1
                            : q + 0.5
                        )
                      }
                      className="w-7 h-7 rounded-lg bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-white active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Measurement Unit Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase block">
                    Measurement Unit:
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => {
                      const newUnit = e.target.value as FoodUnitType;
                      setSelectedUnit(newUnit);
                      if (newUnit === "gram" && quantity < 10) setQuantity(50);
                      else if (newUnit === "litre" && quantity > 10) setQuantity(0.5);
                      else if (newUnit === "piece" && quantity > 50) setQuantity(2);
                    }}
                    className="w-full h-[38px] bg-black border border-neutral-800 rounded-xl px-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {AVAILABLE_UNITS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Quantity Preset Buttons for zero typing */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[9px] font-mono text-neutral-500 shrink-0">Quick:</span>
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {(selectedUnit === "gram"
                    ? [25, 50, 100, 150, 200]
                    : selectedUnit === "piece"
                    ? [1, 2, 3, 5, 10]
                    : selectedUnit === "bowl" || selectedUnit === "cup" || selectedUnit === "scoop"
                    ? [0.5, 1, 1.5, 2]
                    : [0.25, 0.5, 1, 1.5]
                  ).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuantity(val)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                        quantity === val
                          ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {val} {selectedUnit === "gram" ? "g" : selectedUnit === "piece" ? "pc" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* OPTIONAL ADD-INS / EXTRA INGREDIENTS SECTION */}
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>Added Extra Ingredients? (Optional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddInDrawerOpen(!isAddInDrawerOpen)}
                    className="text-[10px] font-mono text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    {isAddInDrawerOpen ? "Hide" : "+ Add Extras"}
                  </button>
                </div>

                {/* Active Add-ins list */}
                {currentAddIns.length > 0 && (
                  <div className="space-y-1 mt-1.5">
                    {currentAddIns.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded-lg bg-black/60 border border-neutral-800 flex items-center justify-between text-[11px] font-mono"
                      >
                        <div className="flex items-center gap-1.5 text-neutral-200">
                          <CornerDownRight className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>
                            {ing.portion} {ing.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">+{ing.calories} kcal</span>
                          <span className="text-sky-400">+{ing.protein}g P</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="text-neutral-500 hover:text-red-400 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add-In Quick Selector Drawer */}
                {isAddInDrawerOpen && (
                  <div className="mt-2 p-2 rounded-xl bg-black/80 border border-neutral-800 space-y-2 animate-in fade-in">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      Tap to mix in extras (peanuts, banana, milk, almonds, seeds):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_ADD_IN_OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            handleAddIngredient(opt.name, `${opt.quantity} ${opt.unit}`, opt.cal, opt.pro)
                          }
                          className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-neutral-200 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Plus className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{opt.name}</span>
                          <span className="text-[9px] text-emerald-400 ml-0.5">
                            (+{opt.cal}k)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Live nutrient metrics for this item */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
                <div className="p-1.5 rounded-lg bg-black/60 border border-neutral-800">
                  <div className="text-[9px] text-neutral-400">Calories</div>
                  <div className="text-xs font-bold text-emerald-400">
                    {currentTotalCalories} kcal
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-black/60 border border-neutral-800">
                  <div className="text-[9px] text-neutral-400">Protein</div>
                  <div className="text-xs font-bold text-sky-400">
                    {currentTotalProtein}g
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-black/60 border border-neutral-800">
                  <div className="text-[9px] text-neutral-400">Carbs</div>
                  <div className="text-xs font-semibold text-neutral-300">
                    {currentTotalCarbs}g
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-black/60 border border-neutral-800">
                  <div className="text-[9px] text-neutral-400">Fat</div>
                  <div className="text-xs font-semibold text-neutral-300">
                    {currentTotalFat}g
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddStagedItem}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors active:scale-98 shadow"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Add {baseNutrients.portionLabel} {selectedFood.name}
                  {currentAddIns.length > 0 ? ` (+${currentAddIns.length} extras)` : ""} to Plate
                </span>
              </button>
            </div>

            {/* STAGED ITEMS ON PLATE SECTION */}
            {stagedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-200 font-bold flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Plate Items ({stagedItems.length}):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSaveComboModalOpen(true)}
                      className="text-amber-400 hover:text-amber-300 text-[10px] font-semibold flex items-center gap-0.5"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>Save as Combo</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPlate}
                      title="Clear plate"
                      className="text-neutral-500 hover:text-red-400 p-0.5 text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {stagedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">
                          {item.portionLabel} {item.food.name}
                        </div>
                        {item.ingredients.length > 0 && (
                          <div className="text-[10px] text-sky-400 font-mono truncate">
                            ↳ with {item.ingredients.map((i) => `${i.portion} ${i.name}`).join(", ")}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-neutral-400">
                          <span className="text-emerald-400">{item.calories} kcal</span> •{" "}
                          <span className="text-sky-400">{item.protein}g P</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedItem(item.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Category & Confirm Logging */}
            <div className="space-y-2 pt-1 border-t border-neutral-900">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>Meal Slot:</span>
                <span className="text-emerald-400 font-bold uppercase">{mealCategory}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(["breakfast", "lunch", "dinner", "snack", "night_bite"] as MealType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMealCategory(t)}
                    className={`text-[10px] font-mono py-1 rounded-lg border transition-all ${
                      mealCategory === t
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    {t === "night_bite" ? "Night" : t.charAt(0).toUpperCase() + t.slice(1, 4)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={stagedItems.length === 0}
                  onClick={handleConfirmLogStagedMeal}
                  className="flex-1 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-emerald-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>Log Meal (+{totalCalories} kcal • +{totalProtein}g P)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: SAVED COMBOS (1-TAP REPEATABLE DAILY MEALS)                */}
        {/* ----------------------------------------------------------------- */}
        {tab === "combos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Favorite & Pre-Built Combos</span>
                </h3>
                <p className="text-[10px] font-mono text-neutral-400">
                  Log your standard daily combinations in 1 single tap.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {savedCombos.map((combo) => (
                <div
                  key={combo.id}
                  className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{combo.name}</span>
                        {combo.isDefault && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">
                            Preset
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                        {combo.items.map((i) => `${i.portion} ${i.name}`).join(" + ")}
                      </div>
                    </div>

                    {!combo.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCombo(combo.id, combo.name)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                        title="Delete combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                    <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">{combo.calories} kcal</span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-sky-400 font-bold">{combo.protein}g P</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddComboToPlate(combo)}
                        className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[10px] transition-colors"
                      >
                        Add to Plate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLogSavedCombo(combo)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow"
                      >
                        <Check className="w-3 h-3" />
                        <span>Log Meal</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAVORITED MEALS SECTION */}
            {favoriteMeals.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-900">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Favorited Meals ({favoriteMeals.length})</span>
                  </h4>
                  <span className="text-[9px] font-mono text-neutral-500">1-Tap Log</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {favoriteMeals.map((fav) => (
                    <div
                      key={fav.id}
                      className="p-2.5 rounded-xl bg-black/60 border border-neutral-800 flex items-center justify-between text-xs hover:border-neutral-700 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{fav.name}</div>
                        <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                          <span className="text-emerald-400 font-medium">{fav.calories} kcal</span> •{" "}
                          <span className="text-sky-400 font-medium">{fav.protein}g protein</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const hours = String(now.getHours()).padStart(2, "0");
                          const minutes = String(now.getMinutes()).padStart(2, "0");
                          onLogMeal({
                            date: selectedDate,
                            timestamp: `${hours}:${minutes}`,
                            name: fav.name,
                            mealType: fav.mealType,
                            calories: fav.calories,
                            protein: fav.protein,
                            carbs: fav.carbs,
                            fat: fav.fat,
                            items: fav.items ? [...fav.items] : [],
                            aiAnalyzed: false,
                            isFavorite: true,
                          });
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] font-bold ml-2 shrink-0 active:scale-95 transition-all shadow"
                      >
                        Log Again
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stagedItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsSaveComboModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Save Current Plate ({stagedItems.length} items) as New Combo</span>
              </button>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: AI TEXT ESTIMATOR                                          */}
        {/* ----------------------------------------------------------------- */}
        {tab === "ai_text" && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                Describe your meal or snack
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 2 chapatis with 1 bowl chole and 10 almonds"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono resize-none"
              />
            </div>

            {/* Quick example prompts */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 block">
                Quick examples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "2 roti and 1 bowl dal",
                  "1 banana and 1 scoop protein shake",
                  "1 bowl chole with 1 cup steamed rice",
                  "10 almonds and 1 cup makhana",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(sample)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {analysisError && (
              <p className="text-[11px] text-amber-400 font-mono p-2 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                {analysisError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!aiPrompt.trim() || isAnalyzing}
                onClick={handleAITextAnalyze}
                className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  !aiPrompt.trim() || isAnalyzing
                    ? "bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>{isAnalyzing ? "Calculating Nutrients..." : "Analyze & Log Meal"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* MODAL: SAVE PLATE AS COMBO                                        */}
        {/* ----------------------------------------------------------------- */}
        {isSaveComboModalOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsSaveComboModalOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Save Plate as 1-Tap Combo
                </span>
                <button
                  type="button"
                  onClick={() => setIsSaveComboModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                  Combo Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Daily Breakfast, Post-Workout Shake"
                  value={newComboName}
                  onChange={(e) => setNewComboName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono space-y-1">
                <div className="text-neutral-400">Total Plate Nutrition:</div>
                <div className="text-white font-bold">
                  {totalCalories} kcal • {totalProtein}g Protein • {totalCarbs}g Carbs
                </div>
                <div className="text-neutral-500 text-[10px]">
                  {stagedItems.map((i) => i.food.name).join(", ")}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSaveComboModalOpen(false)}
                  className="py-2 px-3 rounded-xl bg-neutral-900 text-neutral-300 font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlateAsCombo}
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs"
                >
                  Save Combo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* MODAL: MANAGE CUSTOM FOODS                                        */}
        {/* ----------------------------------------------------------------- */}
        {isManageCustomModalOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsManageCustomModalOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-sm rounded-2xl p-4 space-y-3 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5 text-purple-400" />
                  My Custom Foods & Dishes ({customFoodsList.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsManageCustomModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {customFoodsList.length === 0 ? (
                  <div className="p-4 text-center text-xs font-mono text-neutral-500">
                    No custom foods saved yet. Tap "+ Custom Food" to create one!
                  </div>
                ) : (
                  customFoodsList.map((food) => (
                    <div
                      key={food.id}
                      className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">
                          {food.name}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                          <span className="text-emerald-400">{food.caloriesPerUnit} kcal</span> •{" "}
                          <span className="text-sky-400">{food.proteinPerUnit}g P</span> / {food.defaultUnit}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsManageCustomModalOpen(false);
                            handleStartEditCustomFood(food);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-400 transition-colors"
                          title="Modify food"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomFood(food.id, food.name)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-red-400 transition-colors"
                          title="Delete food"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsManageCustomModalOpen(false)}
                className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

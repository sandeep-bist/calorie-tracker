import React, { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  subscribeToUserMeals,
  saveMealToFirestore,
  updateMealInFirestore,
  deleteMealFromFirestore,
  saveUserTargetsToFirestore,
  getUserTargetsFromFirestore,
} from "./services/userService";
import { Header } from "./components/Header";
import { DailySummary } from "./components/DailySummary";
import { WeeklyTrendsChart } from "./components/WeeklyTrendsChart";
import { MealList } from "./components/MealList";
import { CameraScannerModal } from "./components/CameraScannerModal";
import { ManualAddModal } from "./components/ManualAddModal";
import { SettingsModal } from "./components/SettingsModal";
import { IOSAppModal } from "./components/IOSAppModal";
import { AuthModal } from "./components/AuthModal";
import { ShareAppModal } from "./components/ShareAppModal";
import { WaterTracker } from "./components/WaterTracker";
import { StreakCard } from "./components/StreakCard";
import { BottomBar } from "./components/BottomBar";
import { Meal, DailyTargets } from "./types";
import {
  loadStoredMeals,
  saveStoredMeals,
  loadStoredTargets,
  saveStoredTargets,
  getTodayDateString,
  formatDateLabel,
  loadStoredWater,
  saveStoredWater,
} from "./utils/storage";
import { calculateStreakInfo } from "./utils/streak";
import {
  saveUserWaterToFirestore,
  getUserWaterFromFirestore,
  saveUserStreakToFirestore,
} from "./services/userService";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { Sparkles, CheckCircle2, Apple, Cloud, X, Share2 } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [meals, setMeals] = useState<Meal[]>(() => loadStoredMeals());
  const [targets, setTargets] = useState<DailyTargets>(() => loadStoredTargets());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [waterIntake, setWaterIntake] = useState<number>(() => loadStoredWater(getTodayDateString()));
  const [nightMode, setNightMode] = useState<"standard" | "ultra_dark" | "night_shift">("standard");

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // 1. Firebase Authentication Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);

      if (currentUser) {
        showToast(`Welcome, ${currentUser.displayName || "Athlete"}`);
        // Load user target preferences from Firestore
        try {
          const cloudTargets = await getUserTargetsFromFirestore(currentUser.uid);
          if (cloudTargets) {
            setTargets(cloudTargets);
          } else {
            // First time login: seed cloud targets with existing targets
            await saveUserTargetsToFirestore(
              currentUser.uid,
              currentUser.email,
              currentUser.displayName,
              targets
            );
          }
        } catch (e) {
          console.error("Error loading user targets:", e);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Realtime Firestore Sync for Authenticated User
  useEffect(() => {
    if (!user) {
      // Offline / guest mode: keep state from localStorage
      setMeals(loadStoredMeals());
      return;
    }

    // Subscribe to cloud meals
    const unsubscribeMeals = subscribeToUserMeals(
      user.uid,
      (cloudMeals) => {
        // If user already had some local meals, sync any unsynced ones up to cloud
        const local = loadStoredMeals();
        if (local.length > 0 && cloudMeals.length === 0) {
          local.forEach((m) => {
            saveMealToFirestore(user.uid, m).catch(console.error);
          });
        }
        setMeals(cloudMeals);
      },
      (err) => {
        console.error("Firestore sync error:", err);
      }
    );

    return () => unsubscribeMeals();
  }, [user]);

  // Sync meals to localStorage (offline cache backup)
  useEffect(() => {
    saveStoredMeals(meals);
  }, [meals]);

  // Sync targets to localStorage
  useEffect(() => {
    saveStoredTargets(targets);
  }, [targets]);

  // Sync Water Intake for the selected date
  useEffect(() => {
    const localWater = loadStoredWater(selectedDate);
    setWaterIntake(localWater);

    if (user) {
      getUserWaterFromFirestore(user.uid, selectedDate)
        .then((cloudWater) => {
          if (cloudWater !== null) {
            setWaterIntake(cloudWater);
            saveStoredWater(selectedDate, cloudWater);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch cloud water intake:", err);
        });
    }
  }, [selectedDate, user]);

  const handleUpdateWater = (newAmount: number) => {
    setWaterIntake(newAmount);
    saveStoredWater(selectedDate, newAmount);
    if (user) {
      saveUserWaterToFirestore(user.uid, selectedDate, newAmount).catch((err) =>
        console.error("Failed to save water to cloud:", err)
      );
    }
  };

  // Gamified streak calculation
  const streakInfo = React.useMemo(() => {
    return calculateStreakInfo(meals, { [selectedDate]: waterIntake });
  }, [meals, waterIntake, selectedDate]);

  // Sync streak to Firestore for logged in user
  useEffect(() => {
    if (user && streakInfo.currentStreak > 0) {
      saveUserStreakToFirestore(user.uid, {
        currentStreak: streakInfo.currentStreak,
        longestStreak: streakInfo.longestStreak,
        totalDaysLogged: streakInfo.totalDaysLogged,
      }).catch(console.error);
    }
  }, [user, streakInfo.currentStreak, streakInfo.longestStreak]);

  const handleLogMeal = async (newMealData: Omit<Meal, "id">) => {
    const newMeal: Meal = {
      ...newMealData,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };

    if (user) {
      try {
        await saveMealToFirestore(user.uid, newMeal);
      } catch (err) {
        console.error("Failed to save meal to cloud:", err);
      }
    } else {
      setMeals((prev) => [newMeal, ...prev]);
    }

    showToast(`Logged: +${newMeal.calories} kcal • +${newMeal.protein}g protein`);
  };

  const handleUpdateMeal = async (updated: Meal) => {
    if (user) {
      try {
        await updateMealInFirestore(user.uid, updated);
      } catch (err) {
        console.error("Failed to update meal in cloud:", err);
      }
    } else {
      setMeals((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    }

    showToast(`Updated: ${updated.name}`);
  };

  const handleRepeatMeal = (mealToRepeat: Meal) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    handleLogMeal({
      date: selectedDate,
      timestamp: `${hours}:${minutes}`,
      name: mealToRepeat.name,
      mealType: mealToRepeat.mealType,
      calories: mealToRepeat.calories,
      protein: mealToRepeat.protein,
      carbs: mealToRepeat.carbs,
      fat: mealToRepeat.fat,
      items: mealToRepeat.items ? [...mealToRepeat.items] : undefined,
      notes: mealToRepeat.notes,
      imageUrl: mealToRepeat.imageUrl,
      aiAnalyzed: false,
    });
  };

  const handleDeleteMeal = async (id: string) => {
    if (user) {
      try {
        await deleteMealFromFirestore(user.uid, id);
      } catch (err) {
        console.error("Failed to delete meal from cloud:", err);
      }
    } else {
      setMeals((prev) => prev.filter((m) => m.id !== id));
    }

    showToast("Meal removed");
  };

  const handleSaveTargets = async (newTargets: DailyTargets) => {
    setTargets(newTargets);
    if (user) {
      try {
        await saveUserTargetsToFirestore(
          user.uid,
          user.email,
          user.displayName,
          newTargets
        );
      } catch (err) {
        console.error("Failed to save targets to cloud:", err);
      }
    }
    showToast("Daily targets updated");
  };

  const handleToggleNightMode = () => {
    setNightMode((prev) => {
      if (prev === "standard") return "night_shift";
      if (prev === "night_shift") return "ultra_dark";
      return "standard";
    });
  };

  // Filter meals for the currently selected date
  const dayMeals = meals.filter((m) => m.date === selectedDate);

  // Dynamic root classes for Night Shift / Ultra Dark
  const nightShiftFilterClass =
    nightMode === "night_shift"
      ? "sepia-[0.35] brightness-90 hue-rotate-[-10deg]"
      : nightMode === "ultra_dark"
      ? "brightness-75 contrast-125"
      : "";

  return (
    <div
      className={`min-h-screen bg-black text-neutral-100 flex flex-col font-sans transition-all duration-300 ${nightShiftFilterClass}`}
    >
      {/* Night mode indicator banner if active */}
      {nightMode !== "standard" && (
        <div className="w-full bg-neutral-950/90 border-b border-neutral-900 py-1 px-4 text-center text-[10px] font-mono text-neutral-400 flex items-center justify-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>
            {nightMode === "night_shift"
              ? "Night Shift Tint Active (Blue-light mitigated for sleep)"
              : "Ultra OLED Dim Active (Zero backlight bleed)"}
          </span>
          <button
            type="button"
            onClick={() => setNightMode("standard")}
            className="text-neutral-300 hover:text-white underline ml-1"
          >
            Reset
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        nightMode={nightMode}
        onToggleNightMode={handleToggleNightMode}
        onOpenIOSModal={() => setIsIOSModalOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Optional iOS / PWA Home Screen Installation Prompt Banner */}
      {!isInstalled && !bannerDismissed && (
        <div className="w-full bg-neutral-950 border-b border-neutral-900 px-4 py-2">
          <div className="max-w-md mx-auto flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setIsIOSModalOpen(true);
                }
              }}
              className="flex items-center space-x-2 text-left group"
            >
              <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 group-hover:border-neutral-700">
                <Apple className="w-3.5 h-3.5 fill-white" />
              </div>
              <div>
                <span className="font-semibold text-neutral-200 group-hover:text-white">
                  Run as an iOS App
                </span>
                <span className="text-[10px] text-neutral-400 block -mt-0.5 font-mono">
                  Tap to add to your iPhone Home Screen
                </span>
              </div>
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (isInstallable) {
                    install();
                  } else {
                    setIsIOSModalOpen(true);
                  }
                }}
                className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-emerald-400 font-bold transition-colors"
              >
                {isInstallable ? "Install" : "Setup Guide"}
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss banner"
                className="text-neutral-500 hover:text-neutral-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Sync Prompt for Guest Users */}
      {authReady && !user && !bannerDismissed && (
        <div className="w-full bg-emerald-950/20 border-b border-emerald-900/40 px-4 py-2">
          <div className="max-w-md mx-auto flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-2 text-left"
            >
              <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-neutral-300">
                <strong className="text-white">Sign In with Google</strong> to backup and sync your meals across devices.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[10px] font-bold shrink-0 ml-2"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Main Container - Constrained for Mobile-First ergonomics */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] space-y-4">
        {/* Gamified Streak & Milestones Banner */}
        <StreakCard streak={streakInfo} selectedDate={selectedDate} />

        {/* Daily Summary: Calories & Protein Gauges */}
        <DailySummary meals={dayMeals} targets={targets} />

        {/* Daily Water Intake Tracker */}
        <WaterTracker
          currentMl={waterIntake}
          targetMl={targets.waterTarget || 3000}
          onUpdateWater={handleUpdateWater}
          selectedDateLabel={formatDateLabel(selectedDate)}
        />

        {/* 7-Day Recharts Trend Line Chart */}
        <WeeklyTrendsChart
          meals={meals}
          targets={targets}
          selectedDate={selectedDate}
        />

        {/* Meal Logs List */}
        <MealList
          meals={dayMeals}
          onDelete={handleDeleteMeal}
          onUpdate={handleUpdateMeal}
          onRepeat={handleRepeatMeal}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenManual={() => setIsManualOpen(true)}
        />
      </main>

      {/* Fixed Ergonomic Bottom Bar */}
      <BottomBar
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-neutral-900/95 border border-neutral-800 text-white text-xs font-mono shadow-2xl flex items-center space-x-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Camera & AI Vision Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onLogMeal={handleLogMeal}
        selectedDate={selectedDate}
      />

      {/* Quick Manual / Text Log Modal */}
      <ManualAddModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onLogMeal={handleLogMeal}
        selectedDate={selectedDate}
        favoriteMeals={meals.filter((m) => m.isFavorite)}
      />

      {/* Target Goals Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        targets={targets}
        onSaveTargets={handleSaveTargets}
        onOpenIOSModal={() => setIsIOSModalOpen(true)}
      />

      {/* iOS App Installation & App Store Guide Modal */}
      <IOSAppModal
        isOpen={isIOSModalOpen}
        onClose={() => setIsIOSModalOpen(false)}
      />

      {/* Authentication & Cloud Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Share App and Daily Progress Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        selectedDate={selectedDate}
        meals={dayMeals}
        targets={targets}
      />
    </div>
  );
}

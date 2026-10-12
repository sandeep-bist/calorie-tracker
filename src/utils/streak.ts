import { Meal, DailyTargets, StreakInfo, GamifiedBadge } from "../types";
import { getTodayDateString } from "./storage";

const STREAK_STORAGE_KEY = "night_cal_streak_v1";

/**
 * Calculates streak information based on meal history and today's date.
 */
export function calculateStreakInfo(
  meals: Meal[],
  waterLogsByDate: Record<string, number> = {}
): StreakInfo {
  const todayStr = getTodayDateString();

  // Collect unique dates where activity occurred (meal logged or >0 water logged)
  const activeDatesSet = new Set<string>();

  meals.forEach((m) => {
    if (m.date) activeDatesSet.add(m.date);
  });

  Object.entries(waterLogsByDate).forEach(([date, amount]) => {
    if (amount > 0) activeDatesSet.add(date);
  });

  const totalDaysLogged = activeDatesSet.size;
  const isActiveToday = activeDatesSet.has(todayStr);

  // Parse today's date components
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const todayDate = new Date(ty, tm - 1, td);

  let currentStreak = 0;
  let checkDate = new Date(todayDate);

  // If not active today, check if active yesterday to see if streak is still alive
  if (!isActiveToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count backwards consecutive days
  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, "0");
    const d = String(checkDate.getDate()).padStart(2, "0");
    const dateKey = `${y}-${m}-${d}`;

    if (activeDatesSet.has(dateKey)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Load longest streak from storage
  let longestStreak = currentStreak;
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (typeof stored.longestStreak === "number") {
        longestStreak = Math.max(currentStreak, stored.longestStreak);
      }
    }
  } catch {
    // ignore
  }

  // Save updated streak
  const history: Record<string, boolean> = {};
  activeDatesSet.forEach((d) => {
    history[d] = true;
  });

  const streakData: StreakInfo = {
    currentStreak,
    longestStreak,
    lastActiveDate: isActiveToday ? todayStr : (Array.from(activeDatesSet).sort().pop() || todayStr),
    totalDaysLogged,
    isActiveToday,
    history,
  };

  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
  } catch (err) {
    console.error("Failed to save streak data", err);
  }

  return streakData;
}

/**
 * Returns the user's gamified athlete level based on streak count.
 */
export function getStreakLevel(streakDays: number): {
  level: number;
  title: string;
  color: string;
  nextThreshold: number;
  progressPercent: number;
} {
  if (streakDays >= 30) {
    return {
      level: 5,
      title: "Titan Legend 👑",
      color: "text-amber-300",
      nextThreshold: 50,
      progressPercent: 100,
    };
  }
  if (streakDays >= 14) {
    return {
      level: 4,
      title: "Iron Will 💎",
      color: "text-cyan-300",
      nextThreshold: 30,
      progressPercent: Math.round(((streakDays - 14) / 16) * 100),
    };
  }
  if (streakDays >= 7) {
    return {
      level: 3,
      title: "Blazing Athlete 🌟",
      color: "text-emerald-300",
      nextThreshold: 14,
      progressPercent: Math.round(((streakDays - 7) / 7) * 100),
    };
  }
  if (streakDays >= 3) {
    return {
      level: 2,
      title: "Steady Ember ⚡",
      color: "text-amber-400",
      nextThreshold: 7,
      progressPercent: Math.round(((streakDays - 3) / 4) * 100),
    };
  }
  return {
    level: 1,
    title: "First Spark 🔥",
    color: "text-orange-400",
    nextThreshold: 3,
    progressPercent: Math.round((streakDays / 3) * 100),
  };
}

/**
 * Returns available gamified milestone badges and unlock status.
 */
export function getGamifiedBadges(streakDays: number, totalDays: number): GamifiedBadge[] {
  return [
    {
      id: "badge-first-step",
      title: "First Spark",
      desc: "Log your first meal or water intake",
      icon: "🔥",
      unlocked: totalDays >= 1,
      requiredStreak: 1,
    },
    {
      id: "badge-3-day",
      title: "3-Day Consistency",
      desc: "Keep the flame burning for 3 consecutive days",
      icon: "⚡",
      unlocked: streakDays >= 3,
      requiredStreak: 3,
    },
    {
      id: "badge-7-day",
      title: "Iron Week",
      desc: "Full 7 days unbroken discipline",
      icon: "🛡️",
      unlocked: streakDays >= 7,
      requiredStreak: 7,
    },
    {
      id: "badge-14-day",
      title: "Titan Fortitude",
      desc: "Two full weeks of relentless macro tracking",
      icon: "💎",
      unlocked: streakDays >= 14,
      requiredStreak: 14,
    },
    {
      id: "badge-30-day",
      title: "Nutrition Master",
      desc: "30-day legendary milestone achieved",
      icon: "👑",
      unlocked: streakDays >= 30,
      requiredStreak: 30,
    },
  ];
}

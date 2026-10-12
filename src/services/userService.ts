import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { Meal, DailyTargets } from "../types";

export function subscribeToUserMeals(
  userId: string,
  onMealsUpdated: (meals: Meal[]) => void,
  onError?: (err: unknown) => void
) {
  const mealsPath = `users/${userId}/meals`;
  const mealsCol = collection(db, "users", userId, "meals");
  const q = query(mealsCol, orderBy("date", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const meals: Meal[] = [];
      snapshot.forEach((docSnap) => {
        meals.push(docSnap.data() as Meal);
      });
      // Sort client-side by date then timestamp desc
      meals.sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return (b.timestamp || "").localeCompare(a.timestamp || "");
      });
      onMealsUpdated(meals);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, mealsPath);
      } catch (err) {
        if (onError) onError(err);
      }
    }
  );
}

export async function saveMealToFirestore(userId: string, meal: Meal): Promise<void> {
  const mealPath = `users/${userId}/meals/${meal.id}`;
  try {
    const mealDoc = doc(db, "users", userId, "meals", meal.id);
    await setDoc(mealDoc, {
      ...meal,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, mealPath);
  }
}

export async function updateMealInFirestore(userId: string, meal: Meal): Promise<void> {
  const mealPath = `users/${userId}/meals/${meal.id}`;
  try {
    const mealDoc = doc(db, "users", userId, "meals", meal.id);
    await setDoc(
      mealDoc,
      {
        ...meal,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, mealPath);
  }
}

export async function deleteMealFromFirestore(userId: string, mealId: string): Promise<void> {
  const mealPath = `users/${userId}/meals/${mealId}`;
  try {
    const mealDoc = doc(db, "users", userId, "meals", mealId);
    await deleteDoc(mealDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, mealPath);
  }
}

export async function saveUserTargetsToFirestore(
  userId: string,
  userEmail: string | null,
  displayName: string | null,
  targets: DailyTargets
): Promise<void> {
  const userPath = `users/${userId}`;
  try {
    const userDoc = doc(db, "users", userId);
    await setDoc(
      userDoc,
      {
        id: userId,
        email: userEmail || "",
        displayName: displayName || "User",
        targetCalories: targets.calories,
        targetProtein: targets.protein,
        waterTarget: targets.waterTarget || 3000,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function getUserTargetsFromFirestore(
  userId: string
): Promise<DailyTargets | null> {
  const userPath = `users/${userId}`;
  try {
    const userDoc = doc(db, "users", userId);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const data = snap.data();
      if (typeof data.targetCalories === "number" && typeof data.targetProtein === "number") {
        return {
          calories: data.targetCalories,
          protein: data.targetProtein,
          waterTarget: typeof data.waterTarget === "number" ? data.waterTarget : 3000,
        };
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }
}

export async function saveUserWaterToFirestore(
  userId: string,
  date: string,
  amountMl: number
): Promise<void> {
  const userPath = `users/${userId}`;
  try {
    const userDoc = doc(db, "users", userId);
    await setDoc(
      userDoc,
      {
        [`water_${date}`]: amountMl,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

export async function getUserWaterFromFirestore(
  userId: string,
  date: string
): Promise<number | null> {
  const userPath = `users/${userId}`;
  try {
    const userDoc = doc(db, "users", userId);
    const snap = await getDoc(userDoc);
    if (snap.exists()) {
      const data = snap.data();
      const val = data[`water_${date}`];
      if (typeof val === "number") return val;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }
}

export async function saveUserStreakToFirestore(
  userId: string,
  streak: { currentStreak: number; longestStreak: number; totalDaysLogged: number }
): Promise<void> {
  const userPath = `users/${userId}`;
  try {
    const userDoc = doc(db, "users", userId);
    await setDoc(
      userDoc,
      {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        totalDaysLogged: streak.totalDaysLogged,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

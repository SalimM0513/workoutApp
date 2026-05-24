import { DEFAULT_EXERCISES, STORAGE_KEY } from "./constants";
import type { AppData, Exercise } from "./types";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultExerciseId(name: string): string {
  return `ex-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function createDefaultData(): AppData {
  const exercises: Exercise[] = DEFAULT_EXERCISES.map((e) => ({
    ...e,
    id: defaultExerciseId(e.name),
    isCustom: false,
  }));

  return {
    version: 1,
    exercises,
    workouts: [],
    activeWorkoutId: null,
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return createDefaultData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== 1) return createDefaultData();
    return parsed;
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export { createId };

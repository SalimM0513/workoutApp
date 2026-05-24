import { DEFAULT_EXERCISES, STORAGE_KEY } from "./constants";
import type { AppData, AppDataV1, Exercise, UserSettings } from "./types";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function defaultExerciseId(name: string): string {
  return `ex-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultIntensity: "moderate",
  showCalorieEstimate: true,
};

export function buildDefaultTemplates(): AppData["templates"] {
  const id = (name: string) => defaultExerciseId(name);
  return [
    {
      id: "tpl-push",
      name: "Push Day",
      exerciseIds: [
        id("Bench Press"),
        id("Incline Bench Press"),
        id("Overhead Press"),
        id("Lateral Raise"),
        id("Tricep Pushdown"),
      ],
    },
    {
      id: "tpl-pull",
      name: "Pull Day",
      exerciseIds: [
        id("Deadlift"),
        id("Barbell Row"),
        id("Pull-ups"),
        id("Lat Pulldown"),
        id("Barbell Curl"),
      ],
    },
    {
      id: "tpl-legs",
      name: "Leg Day",
      exerciseIds: [
        id("Squat"),
        id("Romanian Deadlift"),
        id("Leg Press"),
        id("Leg Curl"),
        id("Calf Raise"),
      ],
    },
    {
      id: "tpl-upper",
      name: "Upper",
      exerciseIds: [
        id("Bench Press"),
        id("Barbell Row"),
        id("Overhead Press"),
        id("Barbell Curl"),
      ],
    },
    {
      id: "tpl-lower",
      name: "Lower",
      exerciseIds: [id("Squat"), id("Romanian Deadlift"), id("Leg Press")],
    },
  ];
}

export function createDefaultData(): AppData {
  const exercises: Exercise[] = DEFAULT_EXERCISES.map((e) => ({
    ...e,
    id: defaultExerciseId(e.name),
    isCustom: false,
  }));

  return {
    version: 2,
    exercises,
    workouts: [],
    activeWorkoutId: null,
    templates: buildDefaultTemplates(),
    settings: { ...DEFAULT_SETTINGS },
  };
}

function migrateV1(v1: AppDataV1): AppData {
  return {
    version: 2,
    exercises: v1.exercises,
    workouts: v1.workouts,
    activeWorkoutId: v1.activeWorkoutId,
    templates: buildDefaultTemplates(),
    settings: { ...DEFAULT_SETTINGS },
  };
}

function parseStored(raw: string): AppData {
  const parsed = JSON.parse(raw) as AppData | AppDataV1;
  if (parsed.version === 2) {
    return {
      ...parsed,
      templates: parsed.templates ?? buildDefaultTemplates(),
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  }
  if (parsed.version === 1) return migrateV1(parsed);
  return createDefaultData();
}

export function loadData(): AppData {
  if (typeof window === "undefined") return createDefaultData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("workout-tracker-data-v1");
      if (legacy) {
        const data = parseStored(legacy);
        saveData(data);
        return data;
      }
      return createDefaultData();
    }
    return parseStored(raw);
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export { createId };

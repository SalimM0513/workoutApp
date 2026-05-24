import type { Exercise, MuscleGroup, WorkoutIntensity } from "./types";

export const STORAGE_KEY = "workout-tracker-data-v2";

export const INTENSITY_OPTIONS: {
  id: WorkoutIntensity;
  label: string;
  met: number;
}[] = [
  { id: "light", label: "Light", met: 3 },
  { id: "moderate", label: "Moderate", met: 5 },
  { id: "vigorous", label: "Vigorous", met: 6 },
];

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "legs", label: "Legs" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "core", label: "Core" },
  { id: "other", label: "Other" },
];

export const DEFAULT_EXERCISES: Omit<Exercise, "id">[] = [
  { name: "Bench Press", muscleGroup: "chest" },
  { name: "Incline Bench Press", muscleGroup: "chest" },
  { name: "Dumbbell Fly", muscleGroup: "chest" },
  { name: "Push-ups", muscleGroup: "chest" },
  { name: "Barbell Row", muscleGroup: "back" },
  { name: "Pull-ups", muscleGroup: "back" },
  { name: "Lat Pulldown", muscleGroup: "back" },
  { name: "Deadlift", muscleGroup: "back" },
  { name: "Squat", muscleGroup: "legs" },
  { name: "Leg Press", muscleGroup: "legs" },
  { name: "Romanian Deadlift", muscleGroup: "legs" },
  { name: "Leg Curl", muscleGroup: "legs" },
  { name: "Calf Raise", muscleGroup: "legs" },
  { name: "Overhead Press", muscleGroup: "shoulders" },
  { name: "Lateral Raise", muscleGroup: "shoulders" },
  { name: "Barbell Curl", muscleGroup: "arms" },
  { name: "Hammer Curl", muscleGroup: "arms" },
  { name: "Tricep Pushdown", muscleGroup: "arms" },
  { name: "Skull Crushers", muscleGroup: "arms" },
  { name: "Plank", muscleGroup: "core" },
  { name: "Cable Crunch", muscleGroup: "core" },
];

export const WEIGHT_INCREMENTS = [2.5, 5, 10] as const;

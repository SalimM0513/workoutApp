import { createId } from "./storage";
import type { AppData, Workout, WorkoutExercise, WorkoutSet } from "./types";

export function resolveWorkoutId(
  data: AppData,
  workoutId?: string
): string | null {
  return workoutId ?? data.activeWorkoutId;
}

export function updateWorkoutInData(
  data: AppData,
  workoutId: string,
  updater: (workout: Workout) => Workout
): AppData {
  return {
    ...data,
    workouts: data.workouts.map((w) =>
      w.id === workoutId ? updater(w) : w
    ),
  };
}

export function addExerciseToWorkoutData(
  data: AppData,
  workoutId: string,
  exerciseId: string
): AppData {
  return updateWorkoutInData(data, workoutId, (w) => {
    if (w.exercises.some((e) => e.exerciseId === exerciseId)) return w;
    const entry: WorkoutExercise = { exerciseId, sets: [] };
    return { ...w, exercises: [...w.exercises, entry] };
  });
}

export function removeExerciseFromWorkoutData(
  data: AppData,
  workoutId: string,
  exerciseId: string
): AppData {
  return updateWorkoutInData(data, workoutId, (w) => ({
    ...w,
    exercises: w.exercises.filter((e) => e.exerciseId !== exerciseId),
  }));
}

export function addSetToWorkoutData(
  data: AppData,
  workoutId: string,
  exerciseId: string,
  weight: number,
  reps: number
): AppData {
  const set: WorkoutSet = {
    id: createId(),
    weight,
    reps,
    completedAt: new Date().toISOString(),
  };
  return updateWorkoutInData(data, workoutId, (w) => ({
    ...w,
    exercises: w.exercises.map((e) =>
      e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, set] } : e
    ),
  }));
}

export function updateSetInWorkoutData(
  data: AppData,
  workoutId: string,
  exerciseId: string,
  setId: string,
  weight: number,
  reps: number
): AppData {
  return updateWorkoutInData(data, workoutId, (w) => ({
    ...w,
    exercises: w.exercises.map((e) =>
      e.exerciseId === exerciseId
        ? {
            ...e,
            sets: e.sets.map((s) =>
              s.id === setId ? { ...s, weight, reps } : s
            ),
          }
        : e
    ),
  }));
}

export function removeSetFromWorkoutData(
  data: AppData,
  workoutId: string,
  exerciseId: string,
  setId: string
): AppData {
  return updateWorkoutInData(data, workoutId, (w) => ({
    ...w,
    exercises: w.exercises.map((e) =>
      e.exerciseId === exerciseId
        ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
        : e
    ),
  }));
}

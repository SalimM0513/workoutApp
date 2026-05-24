"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createId, loadData, saveData } from "@/lib/storage";
import type {
  AppData,
  Exercise,
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "@/lib/types";

interface AppDataContextValue {
  data: AppData;
  hydrated: boolean;
  activeWorkout: Workout | null;
  startWorkout: () => Workout;
  endWorkout: (notes?: string) => void;
  cancelWorkout: () => void;
  updateWorkoutNotes: (notes: string) => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  addSet: (exerciseId: string, weight: number, reps: number) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  addCustomExercise: (name: string, muscleGroup: MuscleGroup) => Exercise;
  getExercise: (id: string) => Exercise | undefined;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveData(data);
  }, [data, hydrated]);

  const persist = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => updater(prev));
  }, []);

  const activeWorkout = useMemo(() => {
    if (!data.activeWorkoutId) return null;
    return data.workouts.find((w) => w.id === data.activeWorkoutId) ?? null;
  }, [data]);

  const startWorkout = useCallback((): Workout => {
    const workout: Workout = {
      id: createId(),
      startedAt: new Date().toISOString(),
      exercises: [],
    };
    persist((prev) => ({
      ...prev,
      activeWorkoutId: workout.id,
      workouts: [workout, ...prev.workouts],
    }));
    return workout;
  }, [persist]);

  const endWorkout = useCallback(
    (notes?: string) => {
      if (!data.activeWorkoutId) return;
      persist((prev) => ({
        ...prev,
        activeWorkoutId: null,
        workouts: prev.workouts.map((w) =>
          w.id === prev.activeWorkoutId
            ? {
                ...w,
                endedAt: new Date().toISOString(),
                notes: notes ?? w.notes,
              }
            : w
        ),
      }));
    },
    [data.activeWorkoutId, persist]
  );

  const cancelWorkout = useCallback(() => {
    if (!data.activeWorkoutId) return;
    persist((prev) => ({
      ...prev,
      activeWorkoutId: null,
      workouts: prev.workouts.filter((w) => w.id !== prev.activeWorkoutId),
    }));
  }, [data.activeWorkoutId, persist]);

  const updateWorkoutNotes = useCallback(
    (notes: string) => {
      if (!data.activeWorkoutId) return;
      persist((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) =>
          w.id === prev.activeWorkoutId ? { ...w, notes } : w
        ),
      }));
    },
    [data.activeWorkoutId, persist]
  );

  const addExerciseToWorkout = useCallback(
    (exerciseId: string) => {
      if (!data.activeWorkoutId) return;
      persist((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => {
          if (w.id !== prev.activeWorkoutId) return w;
          if (w.exercises.some((e) => e.exerciseId === exerciseId)) return w;
          const entry: WorkoutExercise = { exerciseId, sets: [] };
          return { ...w, exercises: [...w.exercises, entry] };
        }),
      }));
    },
    [data.activeWorkoutId, persist]
  );

  const addSet = useCallback(
    (exerciseId: string, weight: number, reps: number) => {
      if (!data.activeWorkoutId) return;
      const set: WorkoutSet = {
        id: createId(),
        weight,
        reps,
        completedAt: new Date().toISOString(),
      };
      persist((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => {
          if (w.id !== prev.activeWorkoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map((e) =>
              e.exerciseId === exerciseId
                ? { ...e, sets: [...e.sets, set] }
                : e
            ),
          };
        }),
      }));
    },
    [data.activeWorkoutId, persist]
  );

  const removeSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (!data.activeWorkoutId) return;
      persist((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => {
          if (w.id !== prev.activeWorkoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map((e) =>
              e.exerciseId === exerciseId
                ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
                : e
            ),
          };
        }),
      }));
    },
    [data.activeWorkoutId, persist]
  );

  const addCustomExercise = useCallback(
    (name: string, muscleGroup: MuscleGroup): Exercise => {
      const exercise: Exercise = {
        id: createId(),
        name: name.trim(),
        muscleGroup,
        isCustom: true,
      };
      persist((prev) => ({
        ...prev,
        exercises: [...prev.exercises, exercise],
      }));
      return exercise;
    },
    [persist]
  );

  const getExercise = useCallback(
    (id: string) => data.exercises.find((e) => e.id === id),
    [data.exercises]
  );

  const value = useMemo(
    () => ({
      data,
      hydrated,
      activeWorkout,
      startWorkout,
      endWorkout,
      cancelWorkout,
      updateWorkoutNotes,
      addExerciseToWorkout,
      addSet,
      removeSet,
      addCustomExercise,
      getExercise,
    }),
    [
      data,
      hydrated,
      activeWorkout,
      startWorkout,
      endWorkout,
      cancelWorkout,
      updateWorkoutNotes,
      addExerciseToWorkout,
      addSet,
      removeSet,
      addCustomExercise,
      getExercise,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

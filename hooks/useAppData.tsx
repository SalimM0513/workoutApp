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
  UserSettings,
  Workout,
  WorkoutIntensity,
  WorkoutTemplate,
} from "@/lib/types";
import {
  addExerciseToWorkoutData,
  addSetToWorkoutData,
  removeExerciseFromWorkoutData,
  removeSetFromWorkoutData,
  resolveWorkoutId,
  updateSetInWorkoutData,
  updateWorkoutInData,
} from "@/lib/workout-mutations";

interface AppDataContextValue {
  data: AppData;
  hydrated: boolean;
  activeWorkout: Workout | null;
  startWorkout: (options?: {
    templateId?: string;
    exerciseIds?: string[];
  }) => Workout;
  endWorkout: (options?: {
    notes?: string;
    intensity?: WorkoutIntensity;
  }) => void;
  cancelWorkout: () => void;
  deleteWorkout: (workoutId: string) => void;
  updateWorkout: (
    workoutId: string,
    patch: Partial<Pick<Workout, "notes" | "intensity" | "exercises">>
  ) => void;
  updateWorkoutNotes: (notes: string, workoutId?: string) => void;
  addExerciseToWorkout: (exerciseId: string, workoutId?: string) => void;
  removeExerciseFromWorkout: (exerciseId: string, workoutId?: string) => void;
  addSet: (
    exerciseId: string,
    weight: number,
    reps: number,
    workoutId?: string
  ) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    weight: number,
    reps: number,
    workoutId?: string
  ) => void;
  removeSet: (
    exerciseId: string,
    setId: string,
    workoutId?: string
  ) => void;
  addCustomExercise: (name: string, muscleGroup: MuscleGroup) => Exercise;
  addTemplate: (name: string, exerciseIds: string[]) => WorkoutTemplate;
  updateTemplate: (
    id: string,
    patch: Partial<Pick<WorkoutTemplate, "name" | "exerciseIds">>
  ) => void;
  deleteTemplate: (id: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  getExercise: (id: string) => Exercise | undefined;
  getTemplate: (id: string) => WorkoutTemplate | undefined;
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

  const startWorkout = useCallback(
    (options?: { templateId?: string; exerciseIds?: string[] }): Workout => {
      const workout: Workout = {
        id: createId(),
        startedAt: new Date().toISOString(),
        exercises: [],
      };

      persist((prev) => {
        const template = options?.templateId
          ? prev.templates.find((t) => t.id === options.templateId)
          : undefined;

        const exerciseIds =
          options?.exerciseIds ??
          template?.exerciseIds.filter((id) =>
            prev.exercises.some((e) => e.id === id)
          ) ??
          [];

        const next: Workout = {
          ...workout,
          exercises: exerciseIds.map((exerciseId) => ({
            exerciseId,
            sets: [],
          })),
          templateId: template?.id,
          intensity: prev.settings.defaultIntensity,
        };
        Object.assign(workout, next);
        return {
          ...prev,
          activeWorkoutId: next.id,
          workouts: [next, ...prev.workouts],
        };
      });
      return workout;
    },
    [persist]
  );

  const endWorkout = useCallback(
    (options?: { notes?: string; intensity?: WorkoutIntensity }) => {
      if (!data.activeWorkoutId) return;
      persist((prev) => ({
        ...prev,
        activeWorkoutId: null,
        workouts: prev.workouts.map((w) =>
          w.id === prev.activeWorkoutId
            ? {
                ...w,
                endedAt: new Date().toISOString(),
                notes: options?.notes ?? w.notes,
                intensity: options?.intensity ?? w.intensity,
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

  const deleteWorkout = useCallback(
    (workoutId: string) => {
      persist((prev) => ({
        ...prev,
        activeWorkoutId:
          prev.activeWorkoutId === workoutId ? null : prev.activeWorkoutId,
        workouts: prev.workouts.filter((w) => w.id !== workoutId),
      }));
    },
    [persist]
  );

  const updateWorkout = useCallback(
    (
      workoutId: string,
      patch: Partial<Pick<Workout, "notes" | "intensity" | "exercises">>
    ) => {
      persist((prev) =>
        updateWorkoutInData(prev, workoutId, (w) => ({ ...w, ...patch }))
      );
    },
    [persist]
  );

  const updateWorkoutNotes = useCallback(
    (notes: string, workoutId?: string) => {
      const id = resolveWorkoutId(data, workoutId);
      if (!id) return;
      persist((prev) =>
        updateWorkoutInData(prev, id, (w) => ({ ...w, notes }))
      );
    },
    [data, persist]
  );

  const addExerciseToWorkout = useCallback(
    (exerciseId: string, workoutId?: string) => {
      const id = resolveWorkoutId(data, workoutId);
      if (!id) return;
      persist((prev) => addExerciseToWorkoutData(prev, id, exerciseId));
    },
    [data, persist]
  );

  const removeExerciseFromWorkout = useCallback(
    (exerciseId: string, workoutId?: string) => {
      const id = resolveWorkoutId(data, workoutId);
      if (!id) return;
      persist((prev) =>
        removeExerciseFromWorkoutData(prev, id, exerciseId)
      );
    },
    [data, persist]
  );

  const addSet = useCallback(
    (
      exerciseId: string,
      weight: number,
      reps: number,
      workoutId?: string
    ) => {
      const id = resolveWorkoutId(data, workoutId);
      if (!id) return;
      persist((prev) => addSetToWorkoutData(prev, id, exerciseId, weight, reps));
    },
    [data, persist]
  );

  const updateSet = useCallback(
    (
      exerciseId: string,
      setId: string,
      weight: number,
      reps: number,
      workoutId?: string
    ) => {
      const id = resolveWorkoutId(data, workoutId);
      if (!id) return;
      persist((prev) =>
        updateSetInWorkoutData(prev, id, exerciseId, setId, weight, reps)
      );
    },
    [data, persist]
  );

  const removeSet = useCallback(
    (exerciseId: string, setId: string, workoutId?: string) => {
      const id = resolveWorkoutId(data, workoutId);
      if (!id) return;
      persist((prev) =>
        removeSetFromWorkoutData(prev, id, exerciseId, setId)
      );
    },
    [data, persist]
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

  const addTemplate = useCallback(
    (name: string, exerciseIds: string[]): WorkoutTemplate => {
      const template: WorkoutTemplate = {
        id: createId(),
        name: name.trim(),
        exerciseIds,
      };
      persist((prev) => ({
        ...prev,
        templates: [...prev.templates, template],
      }));
      return template;
    },
    [persist]
  );

  const updateTemplate = useCallback(
    (
      id: string,
      patch: Partial<Pick<WorkoutTemplate, "name" | "exerciseIds">>
    ) => {
      persist((prev) => ({
        ...prev,
        templates: prev.templates.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        ),
      }));
    },
    [persist]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        templates: prev.templates.filter((t) => t.id !== id),
      }));
    },
    [persist]
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      persist((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }));
    },
    [persist]
  );

  const getExercise = useCallback(
    (id: string) => data.exercises.find((e) => e.id === id),
    [data.exercises]
  );

  const getTemplate = useCallback(
    (id: string) => data.templates.find((t) => t.id === id),
    [data.templates]
  );

  const value = useMemo(
    () => ({
      data,
      hydrated,
      activeWorkout,
      startWorkout,
      endWorkout,
      cancelWorkout,
      deleteWorkout,
      updateWorkout,
      updateWorkoutNotes,
      addExerciseToWorkout,
      removeExerciseFromWorkout,
      addSet,
      updateSet,
      removeSet,
      addCustomExercise,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      updateSettings,
      getExercise,
      getTemplate,
    }),
    [
      data,
      hydrated,
      activeWorkout,
      startWorkout,
      endWorkout,
      cancelWorkout,
      deleteWorkout,
      updateWorkout,
      updateWorkoutNotes,
      addExerciseToWorkout,
      removeExerciseFromWorkout,
      addSet,
      updateSet,
      removeSet,
      addCustomExercise,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      updateSettings,
      getExercise,
      getTemplate,
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

import { INTENSITY_OPTIONS } from "./constants";
import type {
  AppData,
  ExerciseStats,
  UserSettings,
  Workout,
  WorkoutIntensity,
  WorkoutSet,
} from "./types";

export function setVolume(set: WorkoutSet): number {
  return set.weight * set.reps;
}

/** Epley formula — estimated 1-rep max */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function workoutVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + setVolume(set), 0),
    0
  );
}

export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function todayKey(): string {
  return toDateKey(new Date().toISOString());
}

export function getCompletedWorkouts(workouts: Workout[]): Workout[] {
  return workouts
    .filter((w) => w.endedAt)
    .sort(
      (a, b) =>
        new Date(b.endedAt!).getTime() - new Date(a.endedAt!).getTime()
    );
}

export function getLastWorkout(workouts: Workout[]): Workout | null {
  return getCompletedWorkouts(workouts)[0] ?? null;
}

export function getWorkoutsOnDate(
  workouts: Workout[],
  dateKey: string
): Workout[] {
  return getCompletedWorkouts(workouts).filter(
    (w) => toDateKey(w.endedAt!) === dateKey
  );
}

export function getWorkoutDayKeys(workouts: Workout[]): Set<string> {
  return new Set(
    getCompletedWorkouts(workouts).map((w) => toDateKey(w.endedAt!))
  );
}

export function volumeForDate(workouts: Workout[], dateKey: string): number {
  return getWorkoutsOnDate(workouts, dateKey).reduce(
    (sum, w) => sum + workoutVolume(w),
    0
  );
}

export function dailyVolumeToday(workouts: Workout[]): number {
  return volumeForDate(workouts, todayKey());
}

export function getLastSetsForExercise(
  workouts: Workout[],
  exerciseId: string,
  activeWorkoutId?: string | null
): WorkoutSet[] {
  if (activeWorkoutId) {
    const active = workouts.find((w) => w.id === activeWorkoutId);
    const entry = active?.exercises.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sets.length > 0) return entry.sets;
  }

  for (const workout of getCompletedWorkouts(workouts)) {
    const entry = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (entry && entry.sets.length > 0) return entry.sets;
  }
  return [];
}

export function getLastSetForExercise(
  workouts: Workout[],
  exerciseId: string,
  activeWorkoutId?: string | null
): WorkoutSet | null {
  const sets = getLastSetsForExercise(workouts, exerciseId, activeWorkoutId);
  return sets[sets.length - 1] ?? null;
}

export function getExerciseStats(
  data: AppData,
  exerciseId: string
): ExerciseStats | null {
  const completed = getCompletedWorkouts(data.workouts);
  const points: ExerciseStats["history"] = [];
  let maxWeight = 0;
  let bestSetVolume = 0;
  let bestE1rm = 0;
  let totalSets = 0;
  let lastWeight = 0;
  let lastReps = 0;

  for (const workout of completed) {
    const entry = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (!entry || entry.sets.length === 0) continue;

    const date = toDateKey(workout.endedAt!);
    let sessionMax = 0;
    let sessionVolume = 0;
    let sessionBestE1rm = 0;

    for (const set of entry.sets) {
      totalSets++;
      sessionMax = Math.max(sessionMax, set.weight);
      sessionVolume += setVolume(set);
      sessionBestE1rm = Math.max(
        sessionBestE1rm,
        estimate1RM(set.weight, set.reps)
      );
      bestSetVolume = Math.max(bestSetVolume, setVolume(set));
      maxWeight = Math.max(maxWeight, set.weight);
      bestE1rm = Math.max(bestE1rm, estimate1RM(set.weight, set.reps));
    }

    points.push({
      date,
      maxWeight: sessionMax,
      volume: sessionVolume,
      bestE1rm: sessionBestE1rm,
    });
    const last = entry.sets[entry.sets.length - 1];
    lastWeight = last.weight;
    lastReps = last.reps;
  }

  if (totalSets === 0) return null;

  return {
    exerciseId,
    lastWeight,
    lastReps,
    maxWeight,
    bestSetVolume,
    bestE1rm,
    totalSets,
    history: points.reverse(),
  };
}

export function workoutDurationMinutes(workout: Workout): number | null {
  if (!workout.endedAt) return null;
  const mins = Math.round(
    (new Date(workout.endedAt).getTime() -
      new Date(workout.startedAt).getTime()) /
      60000
  );
  return mins > 0 ? mins : null;
}

/** Rough MET-based estimate — not derived from weight × reps */
export function estimateWorkoutCalories(
  workout: Workout,
  settings: UserSettings
): number | null {
  const durationMin = workoutDurationMinutes(workout);
  if (!durationMin || durationMin < 5) return null;

  const bodyLbs = settings.bodyWeightLbs;
  if (!bodyLbs || bodyLbs <= 0) return null;

  const intensity: WorkoutIntensity =
    workout.intensity ?? settings.defaultIntensity;
  const met =
    INTENSITY_OPTIONS.find((o) => o.id === intensity)?.met ?? 5;
  const weightKg = bodyLbs * 0.453592;
  const hours = durationMin / 60;
  return Math.round(met * weightKg * hours);
}

export function calculateStreak(workouts: Workout[]): number {
  const completed = getCompletedWorkouts(workouts);
  if (completed.length === 0) return 0;

  const days = new Set(completed.map((w) => toDateKey(w.endedAt!)));

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayKeyLocal = fmt(cursor);
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKeyLocal = fmt(yesterday);

  if (!days.has(todayKeyLocal) && !days.has(yesterdayKeyLocal)) return 0;

  if (!days.has(todayKeyLocal)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDuration(startedAt: string, endedAt: string): string {
  const mins = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000
  );
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

import type { AppData, ExerciseStats, Workout, WorkoutSet } from "./types";

export function setVolume(set: WorkoutSet): number {
  return set.weight * set.reps;
}

export function workoutVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + setVolume(set), 0),
    0
  );
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
  const completed = getCompletedWorkouts(workouts);
  return completed[0] ?? null;
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

  const completed = getCompletedWorkouts(workouts);
  for (const workout of completed) {
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
  const sets = getLastSetsForExercise(
    workouts,
    exerciseId,
    activeWorkoutId
  );
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
  let totalSets = 0;
  let lastWeight = 0;
  let lastReps = 0;

  for (const workout of completed) {
    const entry = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (!entry || entry.sets.length === 0) continue;

    const date = workout.endedAt!.slice(0, 10);
    let sessionMax = 0;
    let sessionVolume = 0;

    for (const set of entry.sets) {
      totalSets++;
      sessionMax = Math.max(sessionMax, set.weight);
      sessionVolume += setVolume(set);
      bestSetVolume = Math.max(bestSetVolume, setVolume(set));
      maxWeight = Math.max(maxWeight, set.weight);
    }

    points.push({ date, maxWeight: sessionMax, volume: sessionVolume });
    lastWeight = entry.sets[entry.sets.length - 1].weight;
    lastReps = entry.sets[entry.sets.length - 1].reps;
  }

  if (totalSets === 0) return null;

  return {
    exerciseId,
    lastWeight,
    lastReps,
    maxWeight,
    bestSetVolume,
    totalSets,
    history: points.reverse(),
  };
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function workoutsThisWeek(workouts: Workout[]): number {
  const weekStart = startOfWeek(new Date());
  return getCompletedWorkouts(workouts).filter(
    (w) => new Date(w.endedAt!) >= weekStart
  ).length;
}

export function totalVolumeAllTime(workouts: Workout[]): number {
  return getCompletedWorkouts(workouts).reduce(
    (sum, w) => sum + workoutVolume(w),
    0
  );
}

export function volumeThisWeek(workouts: Workout[]): number {
  const weekStart = startOfWeek(new Date());
  return getCompletedWorkouts(workouts)
    .filter((w) => new Date(w.endedAt!) >= weekStart)
    .reduce((sum, w) => sum + workoutVolume(w), 0);
}

export function calculateStreak(workouts: Workout[]): number {
  const completed = getCompletedWorkouts(workouts);
  if (completed.length === 0) return 0;

  const days = new Set(
    completed.map((w) => w.endedAt!.slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayKey = cursor.toISOString().slice(0, 10);
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (!days.has(todayKey) && !days.has(yesterdayKey)) return 0;

  if (!days.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
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

export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "other";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completedAt: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  startedAt: string;
  endedAt?: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface AppData {
  version: 1;
  exercises: Exercise[];
  workouts: Workout[];
  activeWorkoutId: string | null;
}

export interface ExerciseStats {
  exerciseId: string;
  lastWeight: number;
  lastReps: number;
  maxWeight: number;
  bestSetVolume: number;
  totalSets: number;
  history: { date: string; maxWeight: number; volume: number }[];
}

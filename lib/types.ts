export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "other";

export type WorkoutIntensity = "light" | "moderate" | "vigorous";

export type ProgressMetric = "maxWeight" | "volume" | "e1rm";

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
  templateId?: string;
  intensity?: WorkoutIntensity;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface UserSettings {
  bodyWeightLbs?: number;
  defaultIntensity: WorkoutIntensity;
  showCalorieEstimate: boolean;
}

export interface AppDataV1 {
  version: 1;
  exercises: Exercise[];
  workouts: Workout[];
  activeWorkoutId: string | null;
}

export interface AppData {
  version: 2;
  exercises: Exercise[];
  workouts: Workout[];
  activeWorkoutId: string | null;
  templates: WorkoutTemplate[];
  settings: UserSettings;
}

export interface ExerciseHistoryPoint {
  date: string;
  maxWeight: number;
  volume: number;
  bestE1rm: number;
}

export interface ExerciseStats {
  exerciseId: string;
  lastWeight: number;
  lastReps: number;
  maxWeight: number;
  bestSetVolume: number;
  bestE1rm: number;
  totalSets: number;
  history: ExerciseHistoryPoint[];
}

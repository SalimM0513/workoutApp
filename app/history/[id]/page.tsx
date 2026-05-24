"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import {
  estimateWorkoutCalories,
  formatDate,
  formatDuration,
  formatVolume,
  setVolume,
  workoutVolume,
} from "@/lib/stats";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, hydrated, getExercise, deleteWorkout } = useAppData();
  const workout = data.workouts.find((w) => w.id === id);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!workout || !workout.endedAt) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-zinc-500">Workout not found.</p>
        <Link href="/history" className="mt-4 inline-block text-accent">
          ← Back to history
        </Link>
      </div>
    );
  }

  const calories = estimateWorkoutCalories(workout, data.settings);

  const handleDelete = () => {
    if (confirm("Delete this workout permanently?")) {
      deleteWorkout(workout.id);
      router.push("/history");
    }
  };

  return (
    <div className="px-4 pt-8 pb-8">
      <Link
        href="/history"
        className="mb-4 inline-block text-sm text-zinc-400"
      >
        ← History
      </Link>

      <h1 className="text-2xl font-bold">{formatDate(workout.endedAt)}</h1>
      <p className="mt-1 text-sm text-zinc-400">
        {formatDuration(workout.startedAt, workout.endedAt)} ·{" "}
        {formatVolume(workoutVolume(workout))} lbs volume
      </p>

      {calories !== null && data.settings.showCalorieEstimate && (
        <Card className="mt-4">
          <p className="text-sm font-medium text-accent">
            Estimated calories burned: ~{calories} kcal
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Approximate — based on duration and intensity, not weight × reps.
          </p>
        </Card>
      )}

      {workout.notes && (
        <Card className="mt-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Notes</p>
          <p className="mt-2 text-zinc-300">{workout.notes}</p>
        </Card>
      )}

      <div className="mt-4 flex gap-3">
        <Link href={`/history/${workout.id}/edit`} className="flex-1">
          <Button variant="secondary" className="w-full">
            Edit workout
          </Button>
        </Link>
        <Button variant="danger" className="flex-1" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {workout.exercises.map((entry) => {
          const exercise = getExercise(entry.exerciseId);
          if (!exercise) return null;

          return (
            <Card key={entry.exerciseId}>
              <h2 className="font-semibold">{exercise.name}</h2>
              <ul className="mt-3 space-y-2">
                {entry.sets.map((set, i) => (
                  <li
                    key={set.id}
                    className="flex justify-between text-sm border-b border-surface-border/50 pb-2 last:border-0"
                  >
                    <span className="text-zinc-400">Set {i + 1}</span>
                    <span>
                      {set.weight} × {set.reps}{" "}
                      <span className="text-zinc-500">
                        ({setVolume(set)} vol)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

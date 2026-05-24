"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import { getExerciseStats, getLastSetsForExercise } from "@/lib/stats";
import { ExerciseProgressPanel } from "@/components/ExerciseProgressPanel";
import { Card } from "@/components/Card";

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, hydrated, getExercise } = useAppData();
  const exercise = getExercise(id);
  const stats = getExerciseStats(data, id);
  const lastSets = getLastSetsForExercise(data.workouts, id);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-zinc-500">Exercise not found.</p>
        <Link href="/library" className="mt-4 inline-block text-accent">
          ← Library
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-8">
      <Link href="/library" className="mb-4 inline-block text-sm text-zinc-400">
        ← Library
      </Link>

      <h1 className="text-2xl font-bold">{exercise.name}</h1>
      <p className="mt-1 text-sm capitalize text-zinc-500">
        {exercise.muscleGroup}
      </p>

      {lastSets.length > 0 && (
        <Card className="mt-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Last working sets
          </p>
          <p className="mt-2 text-lg font-semibold">
            {lastSets.map((s) => `${s.weight}×${s.reps}`).join(" · ")}
          </p>
        </Card>
      )}

      {stats ? (
        <div className="mt-6">
          <ExerciseProgressPanel name={exercise.name} stats={stats} />
        </div>
      ) : (
        <p className="mt-8 text-center text-zinc-500">
          Log this exercise in a workout to track progress.
        </p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAppData } from "@/hooks/useAppData";
import {
  formatDate,
  formatDuration,
  formatVolume,
  getCompletedWorkouts,
  workoutVolume,
} from "@/lib/stats";
import { Card } from "@/components/Card";

export default function HistoryPage() {
  const { data, hydrated, getExercise } = useAppData();
  const workouts = getCompletedWorkouts(data.workouts);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold">History</h1>

      {workouts.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">
          No completed workouts yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => {
            const names = w.exercises
              .map((e) => getExercise(e.exerciseId)?.name)
              .filter(Boolean)
              .slice(0, 3);
            const more = w.exercises.length - names.length;

            return (
              <li key={w.id}>
                <Link href={`/history/${w.id}`}>
                  <Card className="block active:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{formatDate(w.endedAt!)}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {w.exercises.length} exercises ·{" "}
                          {w.exercises.reduce((n, e) => n + e.sets.length, 0)}{" "}
                          sets
                          {w.endedAt &&
                            w.startedAt &&
                            ` · ${formatDuration(w.startedAt, w.endedAt)}`}
                        </p>
                        {names.length > 0 && (
                          <p className="mt-2 text-sm text-zinc-500 line-clamp-1">
                            {names.join(", ")}
                            {more > 0 ? ` +${more} more` : ""}
                          </p>
                        )}
                        {w.notes && (
                          <p className="mt-2 text-sm italic text-zinc-500 line-clamp-2">
                            {w.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-accent">
                          {formatVolume(workoutVolume(w))}
                        </p>
                        <p className="text-xs text-zinc-500">lbs vol</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

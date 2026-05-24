"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import {
  calculateStreak,
  formatVolume,
  getExerciseStats,
  totalVolumeAllTime,
  volumeThisWeek,
  workoutsThisWeek,
} from "@/lib/stats";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { Card } from "@/components/Card";
import { ProgressChart } from "@/components/ProgressChart";

export default function StatsPage() {
  const { data, hydrated, getExercise } = useAppData();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );

  const weekCount = workoutsThisWeek(data.workouts);
  const weekVolume = volumeThisWeek(data.workouts);
  const streak = calculateStreak(data.workouts);
  const allTimeVolume = totalVolumeAllTime(data.workouts);

  const exercisesWithStats = useMemo(() => {
    const seen = new Set<string>();
    for (const w of data.workouts) {
      if (!w.endedAt) continue;
      for (const e of w.exercises) {
        if (e.sets.length > 0) seen.add(e.exerciseId);
      }
    }
    return Array.from(seen)
      .map((id) => ({
        id,
        name: getExercise(id)?.name ?? "Unknown",
        stats: getExerciseStats(data, id),
      }))
      .filter((x) => x.stats)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, getExercise]);

  const selectedStats = selectedExerciseId
    ? getExerciseStats(data, selectedExerciseId)
    : null;
  const selectedName = selectedExerciseId
    ? getExercise(selectedExerciseId)?.name
    : null;

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-8">
      <h1 className="mb-6 text-2xl font-bold">Stats</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            This week
          </p>
          <p className="mt-1 text-2xl font-bold">{weekCount}</p>
          <p className="text-xs text-zinc-500">workouts</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Week volume
          </p>
          <p className="mt-1 text-2xl font-bold text-accent">
            {formatVolume(weekVolume)}
          </p>
          <p className="text-xs text-zinc-500">lbs</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Streak
          </p>
          <p className="mt-1 text-2xl font-bold">{streak} days</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            All-time volume
          </p>
          <p className="mt-1 text-2xl font-bold">
            {formatVolume(allTimeVolume)}
          </p>
          <p className="text-xs text-zinc-500">lbs</p>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Exercise progress</h2>

      {exercisesWithStats.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          Complete a workout to see progress here.
        </p>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4">
            {exercisesWithStats.map(({ id, name }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setSelectedExerciseId((cur) => (cur === id ? null : id))
                }
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                  selectedExerciseId === id
                    ? "bg-accent text-black"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {selectedStats && selectedName && (
            <Card>
              <h3 className="font-semibold">{selectedName}</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <p className="text-zinc-500">PR</p>
                  <p className="font-bold text-accent">
                    {selectedStats.maxWeight} lbs
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Last</p>
                  <p className="font-bold">
                    {selectedStats.lastWeight}×{selectedStats.lastReps}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Sets</p>
                  <p className="font-bold">{selectedStats.totalSets}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs text-zinc-500">Max weight over time</p>
                <ProgressChart stats={selectedStats} />
              </div>
            </Card>
          )}

          <ul className="mt-6 space-y-2">
            {exercisesWithStats.map(({ id, name, stats }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setSelectedExerciseId(id)}
                  className="flex w-full min-h-[52px] items-center justify-between rounded-xl border border-surface-border bg-surface-raised px-4 text-left active:bg-zinc-800"
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-sm text-zinc-400">
                    PR {stats!.maxWeight} lbs
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Exercise library</h2>
        <p className="text-sm text-zinc-500 mb-3">
          {data.exercises.length} exercises ·{" "}
          {data.exercises.filter((e) => e.isCustom).length} custom
        </p>
        {MUSCLE_GROUPS.map((group) => {
          const items = data.exercises.filter(
            (e) => e.muscleGroup === group.id
          );
          if (items.length === 0) return null;
          return (
            <div key={group.id} className="mb-4">
              <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((e) => (
                  <span
                    key={e.id}
                    className="rounded-lg bg-zinc-800/80 px-3 py-1.5 text-sm text-zinc-300"
                  >
                    {e.name}
                    {e.isCustom && (
                      <span className="ml-1 text-accent text-xs">*</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

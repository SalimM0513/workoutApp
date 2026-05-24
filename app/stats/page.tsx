"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import {
  calculateStreak,
  dailyVolumeToday,
  formatVolume,
  getExerciseStats,
} from "@/lib/stats";
import { INTENSITY_OPTIONS } from "@/lib/constants";
import type { WorkoutIntensity } from "@/lib/types";
import { Card } from "@/components/Card";
import { ExerciseProgressPanel } from "@/components/ExerciseProgressPanel";

export default function StatsPage() {
  const { data, hydrated, getExercise, updateSettings } = useAppData();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );

  const todayVol = dailyVolumeToday(data.workouts);
  const streak = calculateStreak(data.workouts);
  const completedCount = data.workouts.filter((w) => w.endedAt).length;

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
        <Card className="col-span-2 border-accent/20">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Today&apos;s volume
          </p>
          <p className="mt-1 text-3xl font-bold text-accent">
            {formatVolume(todayVol)}
          </p>
          <p className="text-xs text-zinc-500">lbs (weight × reps today)</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Streak
          </p>
          <p className="mt-1 text-2xl font-bold">{streak} days</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Workouts
          </p>
          <p className="mt-1 text-2xl font-bold">{completedCount}</p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="font-semibold">Settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Body weight (lbs) — for calorie estimate
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 180"
              value={
                data.settings.bodyWeightLbs != null
                  ? String(data.settings.bodyWeightLbs)
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (!raw) {
                  updateSettings({ bodyWeightLbs: undefined });
                  return;
                }
                const v = parseFloat(raw);
                if (Number.isFinite(v) && v > 0) {
                  updateSettings({ bodyWeightLbs: v });
                }
              }}
              className="h-12 w-full rounded-xl border border-surface-border bg-surface px-4"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Default workout intensity
            </label>
            <div className="flex gap-2">
              {INTENSITY_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() =>
                    updateSettings({
                      defaultIntensity: o.id as WorkoutIntensity,
                    })
                  }
                  className={`min-h-[44px] flex-1 rounded-xl text-sm font-medium ${
                    data.settings.defaultIntensity === o.id
                      ? "bg-accent text-black"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex min-h-[44px] items-center gap-3">
            <input
              type="checkbox"
              checked={data.settings.showCalorieEstimate}
              onChange={(e) =>
                updateSettings({ showCalorieEstimate: e.target.checked })
              }
              className="h-5 w-5 rounded accent-accent"
            />
            <span className="text-sm">Show estimated calories when finishing</span>
          </label>
        </div>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exercise progress</h2>
        <Link href="/library" className="text-sm text-accent">
          Library →
        </Link>
      </div>

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
            <div className="mb-6">
              <ExerciseProgressPanel name={selectedName} stats={selectedStats} />
            </div>
          )}

          <ul className="space-y-2">
            {exercisesWithStats.map(({ id, name, stats }) => (
              <li key={id}>
                <Link
                  href={`/library/${id}`}
                  className="flex w-full min-h-[52px] items-center justify-between rounded-xl border border-surface-border bg-surface-raised px-4 text-left active:bg-zinc-800"
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-sm text-zinc-400">
                    PR {stats!.maxWeight} lbs
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link
        href="/templates"
        className="mt-8 block text-center text-sm font-medium text-accent"
      >
        Workout templates →
      </Link>
    </div>
  );
}

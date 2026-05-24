"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WEIGHT_INCREMENTS } from "@/lib/constants";
import { getLastSetForExercise, getLastSetsForExercise } from "@/lib/stats";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "./Button";

interface SetLoggerProps {
  exerciseId: string;
  onLogged?: () => void;
}

export function SetLogger({ exerciseId, onLogged }: SetLoggerProps) {
  const { data, addSet, getExercise } = useAppData();
  const exercise = getExercise(exerciseId);
  const { lastSets, sessionLabel } = useMemo(() => {
    const priorSets = getLastSetsForExercise(data.workouts, exerciseId);
    const todaySets =
      data.activeWorkoutId &&
      data.workouts
        .find((w) => w.id === data.activeWorkoutId)
        ?.exercises.find((e) => e.exerciseId === exerciseId)?.sets;

    if (todaySets && todaySets.length > 0) {
      return { lastSets: todaySets, sessionLabel: "Today" as const };
    }
    return {
      lastSets: priorSets,
      sessionLabel: priorSets.length > 0 ? ("Last workout" as const) : null,
    };
  }, [data.workouts, data.activeWorkoutId, exerciseId]);

  const prefill = getLastSetForExercise(
    data.workouts,
    exerciseId,
    data.activeWorkoutId
  );

  const [weight, setWeight] = useState(prefill?.weight ?? 0);
  const [reps, setReps] = useState(prefill?.reps ?? 8);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefill) {
      setWeight(prefill.weight);
      setReps(prefill.reps);
    }
  }, [exerciseId, prefill?.weight, prefill?.reps]);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  const logSet = useCallback(() => {
    if (weight <= 0 || reps <= 0) return;
    addSet(exerciseId, weight, reps);
    setFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 400);
    onLogged?.();
  }, [addSet, exerciseId, weight, reps, onLogged]);

  const adjustWeight = (delta: number) =>
    setWeight((w) => Math.max(0, Math.round((w + delta) * 10) / 10));

  const adjustReps = (delta: number) =>
    setReps((r) => Math.max(1, r + delta));

  if (!exercise) return null;

  return (
    <div className="space-y-4">
      {sessionLabel && lastSets.length > 0 && (
        <p className="text-sm text-zinc-400">
          {sessionLabel}:{" "}
          {lastSets.map((s) => `${s.weight}×${s.reps}`).join(" · ")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Weight (lbs)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustWeight(-5)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold active:bg-zinc-700"
              aria-label="Decrease weight by 5"
            >
              −
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={weight || ""}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="h-14 min-w-0 flex-1 rounded-xl border border-surface-border bg-surface text-center text-2xl font-bold text-white"
            />
            <button
              type="button"
              onClick={() => adjustWeight(5)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold active:bg-zinc-700"
              aria-label="Increase weight by 5"
            >
              +
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEIGHT_INCREMENTS.map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => adjustWeight(inc)}
                className="rounded-lg bg-zinc-800/80 px-3 py-2 text-sm font-medium text-zinc-300 active:bg-zinc-700"
              >
                +{inc}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            Reps
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold active:bg-zinc-700"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value, 10) || 1)}
              className="h-14 min-w-0 flex-1 rounded-xl border border-surface-border bg-surface text-center text-2xl font-bold text-white"
            />
            <button
              type="button"
              onClick={() => adjustReps(1)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold active:bg-zinc-700"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className={`w-full sticky bottom-20 z-40 shadow-lg shadow-accent/20 transition-transform ${
          flash ? "scale-[0.97] ring-2 ring-accent" : ""
        }`}
        onClick={logSet}
      >
        {flash ? "Logged ✓" : `Log Set · ${weight}×${reps}`}
      </Button>
    </div>
  );
}

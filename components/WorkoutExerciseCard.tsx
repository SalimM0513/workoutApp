"use client";

import { useState } from "react";
import { getExerciseStats } from "@/lib/stats";
import type { WorkoutExercise } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { SetLogger } from "./SetLogger";
import { Card } from "./Card";

interface WorkoutExerciseCardProps {
  entry: WorkoutExercise;
  expanded?: boolean;
  onToggle?: () => void;
}

export function WorkoutExerciseCard({
  entry,
  expanded = false,
  onToggle,
}: WorkoutExerciseCardProps) {
  const { data, getExercise, removeSet } = useAppData();
  const exercise = getExercise(entry.exerciseId);
  const stats = getExerciseStats(data, entry.exerciseId);
  const [localExpanded, setLocalExpanded] = useState(expanded);
  const isOpen = onToggle ? expanded : localExpanded;

  const toggle = () => {
    if (onToggle) onToggle();
    else setLocalExpanded((v) => !v);
  };

  if (!exercise) return null;

  return (
    <Card id={`exercise-${entry.exerciseId}`} className="overflow-hidden p-0">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between p-4 text-left active:bg-zinc-800/30"
      >
        <div>
          <h3 className="text-lg font-semibold">{exercise.name}</h3>
          {stats && (
            <p className="mt-0.5 text-sm text-zinc-400">
              PR {stats.maxWeight} lbs · {entry.sets.length} sets today
            </p>
          )}
        </div>
        <span className="text-2xl text-zinc-500">{isOpen ? "−" : "+"}</span>
      </button>

      {entry.sets.length > 0 && (
        <ul className="border-t border-surface-border px-4 py-2">
          {entry.sets.map((set, i) => (
            <li
              key={set.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="text-zinc-400">Set {i + 1}</span>
              <span className="font-medium">
                {set.weight} lbs × {set.reps}
              </span>
              <button
                type="button"
                onClick={() => removeSet(entry.exerciseId, set.id)}
                className="min-h-[36px] px-2 text-zinc-500 active:text-red-400"
                aria-label="Remove set"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && (
        <div className="border-t border-surface-border p-4">
          <SetLogger exerciseId={entry.exerciseId} />
        </div>
      )}
    </Card>
  );
}

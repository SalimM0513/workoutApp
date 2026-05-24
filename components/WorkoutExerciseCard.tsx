"use client";

import { useState } from "react";
import { getExerciseStats } from "@/lib/stats";
import type { WorkoutExercise } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { SetLogger } from "./SetLogger";
import { SetRowEditor } from "./SetRowEditor";
import { Card } from "./Card";

interface WorkoutExerciseCardProps {
  workoutId: string;
  entry: WorkoutExercise;
  expanded?: boolean;
  onToggle?: () => void;
  editable?: boolean;
}

export function WorkoutExerciseCard({
  workoutId,
  entry,
  expanded = false,
  onToggle,
  editable = true,
}: WorkoutExerciseCardProps) {
  const { data, getExercise, removeExerciseFromWorkout } = useAppData();
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
              Last {stats.lastWeight}×{stats.lastReps} · PR {stats.maxWeight}{" "}
              lbs · {entry.sets.length} sets
            </p>
          )}
        </div>
        <span className="text-2xl text-zinc-500">{isOpen ? "−" : "+"}</span>
      </button>

      {entry.sets.length > 0 && (
        <ul className="border-t border-surface-border px-4 py-1">
          {entry.sets.map((set, i) =>
            editable ? (
              <SetRowEditor
                key={set.id}
                workoutId={workoutId}
                exerciseId={entry.exerciseId}
                set={set}
                index={i}
              />
            ) : (
              <li
                key={set.id}
                className="flex justify-between py-2 text-sm border-b border-surface-border/50 last:border-0"
              >
                <span className="text-zinc-400">Set {i + 1}</span>
                <span className="font-medium">
                  {set.weight} lbs × {set.reps}
                </span>
              </li>
            )
          )}
        </ul>
      )}

      {isOpen && editable && (
        <div className="border-t border-surface-border p-4">
          <SetLogger exerciseId={entry.exerciseId} workoutId={workoutId} />
          <button
            type="button"
            onClick={() => {
              if (
                entry.sets.length > 0 &&
                !confirm(`Remove ${exercise.name} from this workout?`)
              )
                return;
              removeExerciseFromWorkout(entry.exerciseId, workoutId);
            }}
            className="mt-4 text-sm text-zinc-500 underline"
          >
            Remove exercise
          </button>
        </div>
      )}
    </Card>
  );
}

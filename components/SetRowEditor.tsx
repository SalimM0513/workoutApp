"use client";

import { useEffect, useState } from "react";
import type { WorkoutSet } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";

interface SetRowEditorProps {
  workoutId: string;
  exerciseId: string;
  set: WorkoutSet;
  index: number;
}

export function SetRowEditor({
  workoutId,
  exerciseId,
  set,
  index,
}: SetRowEditorProps) {
  const { updateSet, removeSet } = useAppData();
  const [weightStr, setWeightStr] = useState(String(set.weight));
  const [repsStr, setRepsStr] = useState(String(set.reps));

  useEffect(() => {
    setWeightStr(String(set.weight));
    setRepsStr(String(set.reps));
  }, [set.weight, set.reps]);

  const commit = () => {
    const w = parseFloat(weightStr);
    const r = parseInt(repsStr, 10);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(r) || r <= 0) {
      setWeightStr(String(set.weight));
      setRepsStr(String(set.reps));
      return;
    }
    if (w !== set.weight || r !== set.reps) {
      updateSet(exerciseId, set.id, w, r, workoutId);
    }
  };

  return (
    <li className="flex items-center gap-2 py-2 text-sm border-b border-surface-border/50 last:border-0">
      <span className="w-12 shrink-0 text-zinc-400">Set {index + 1}</span>
      <input
        type="text"
        inputMode="decimal"
        value={weightStr}
        onChange={(e) => setWeightStr(e.target.value)}
        onBlur={commit}
        className="h-11 min-w-0 flex-1 rounded-lg border border-surface-border bg-surface px-2 text-center font-medium"
        aria-label={`Set ${index + 1} weight`}
      />
      <span className="text-zinc-500">×</span>
      <input
        type="text"
        inputMode="numeric"
        value={repsStr}
        onChange={(e) => setRepsStr(e.target.value)}
        onBlur={commit}
        className="h-11 w-16 rounded-lg border border-surface-border bg-surface px-2 text-center font-medium"
        aria-label={`Set ${index + 1} reps`}
      />
      <button
        type="button"
        onClick={() => removeSet(exerciseId, set.id, workoutId)}
        className="min-h-[44px] min-w-[44px] text-zinc-500 active:text-red-400"
        aria-label="Remove set"
      >
        ×
      </button>
    </li>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "@/hooks/useAppData";
import { getLastSetForExercise, getExerciseStats } from "@/lib/stats";
import { MUSCLE_GROUPS } from "@/lib/constants";
import type { MuscleGroup } from "@/lib/types";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function LibraryPage() {
  const { data, hydrated, addCustomExercise } = useAppData();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("other");

  const handleAdd = () => {
    if (!name.trim()) return;
    addCustomExercise(name, group);
    setName("");
    setShowAdd(false);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Exercise library</h1>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="min-h-[44px] rounded-xl px-3 text-sm font-medium text-accent"
        >
          {showAdd ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAdd && (
        <Card className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-xl border border-surface-border bg-surface px-4"
          />
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value as MuscleGroup)}
            className="h-12 w-full rounded-xl border border-surface-border bg-surface px-4"
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <Button className="w-full" onClick={handleAdd}>
            Save exercise
          </Button>
        </Card>
      )}

      <p className="mb-4 text-sm text-zinc-500">
        {data.exercises.length} exercises · tap for progress & history
      </p>

      {MUSCLE_GROUPS.map((mg) => {
        const items = data.exercises.filter((e) => e.muscleGroup === mg.id);
        if (items.length === 0) return null;
        return (
          <section key={mg.id} className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase text-zinc-500">
              {mg.label}
            </h2>
            <ul className="space-y-2">
              {items.map((ex) => {
                const last = getLastSetForExercise(data.workouts, ex.id);
                const stats = getExerciseStats(data, ex.id);
                return (
                  <li key={ex.id}>
                    <Link href={`/library/${ex.id}`}>
                      <Card className="flex items-center justify-between active:bg-zinc-800/50">
                        <div>
                          <p className="font-medium">
                            {ex.name}
                            {ex.isCustom && (
                              <span className="ml-1 text-xs text-accent">*</span>
                            )}
                          </p>
                          {last && (
                            <p className="mt-0.5 text-sm text-zinc-400">
                              Last: {last.weight}×{last.reps}
                            </p>
                          )}
                        </div>
                        {stats && (
                          <span className="text-sm text-accent">
                            PR {stats.maxWeight}
                          </span>
                        )}
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

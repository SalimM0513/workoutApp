"use client";

import { useMemo, useState } from "react";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { getLastSetForExercise } from "@/lib/stats";
import type { MuscleGroup } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "./Button";

interface ExercisePickerProps {
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
  excludeIds?: string[];
}

export function ExercisePicker({
  onSelect,
  onClose,
  excludeIds = [],
}: ExercisePickerProps) {
  const { data, addCustomExercise } = useAppData();
  const [filter, setFilter] = useState<MuscleGroup | "all">("all");
  const [search, setSearch] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState<MuscleGroup>("other");

  const exercises = useMemo(() => {
    return data.exercises
      .filter((e) => !excludeIds.includes(e.id))
      .filter((e) => filter === "all" || e.muscleGroup === filter)
      .filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase().trim())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.exercises, excludeIds, filter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof exercises>();
    for (const ex of exercises) {
      const key = ex.muscleGroup;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ex);
    }
    return map;
  }, [exercises]);

  const handleCustom = () => {
    if (!customName.trim()) return;
    const ex = addCustomExercise(customName, customGroup);
    onSelect(ex.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <h2 className="text-lg font-semibold">Add Exercise</h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] rounded-xl px-3 text-zinc-400 active:bg-zinc-800"
        >
          Done
        </button>
      </header>

      <div className="space-y-3 border-b border-surface-border p-4">
        <input
          type="search"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 w-full rounded-xl border border-surface-border bg-surface-raised px-4 text-base"
          autoFocus
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="All"
          />
          {MUSCLE_GROUPS.map((g) => (
            <FilterChip
              key={g.id}
              active={filter === g.id}
              onClick={() => setFilter(g.id)}
              label={g.label}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm font-medium text-accent"
        >
          {showCustom ? "Hide" : "+ Create custom exercise"}
        </button>
        {showCustom && (
          <div className="space-y-3 rounded-xl border border-surface-border bg-surface-raised p-3">
            <input
              type="text"
              placeholder="Exercise name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="h-12 w-full rounded-lg border border-surface-border bg-surface px-3"
            />
            <select
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value as MuscleGroup)}
              className="h-12 w-full rounded-lg border border-surface-border bg-surface px-3"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <Button className="w-full" onClick={handleCustom}>
              Save & Add
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {filter === "all" ? (
          Array.from(grouped.entries()).map(([group, items]) => (
            <section key={group} className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {MUSCLE_GROUPS.find((g) => g.id === group)?.label ?? group}
              </h3>
              <ul className="space-y-2">
                {items.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    exerciseId={ex.id}
                    name={ex.name}
                    onClick={() => {
                      onSelect(ex.id);
                      onClose();
                    }}
                  />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <ul className="space-y-2">
            {exercises.map((ex) => (
              <ExerciseRow
                key={ex.id}
                exerciseId={ex.id}
                name={ex.name}
                onClick={() => {
                  onSelect(ex.id);
                  onClose();
                }}
              />
            ))}
          </ul>
        )}
        {exercises.length === 0 && (
          <p className="py-8 text-center text-zinc-500">No exercises found</p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
        active
          ? "bg-accent text-black"
          : "bg-zinc-800 text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function ExerciseRow({
  exerciseId,
  name,
  onClick,
}: {
  exerciseId: string;
  name: string;
  onClick: () => void;
}) {
  const { data } = useAppData();
  const last = getLastSetForExercise(
    data.workouts,
    exerciseId,
    data.activeWorkoutId
  );

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised px-4 text-left active:bg-zinc-800"
      >
        <span className="text-base font-medium">{name}</span>
        {last && (
          <span className="shrink-0 text-sm text-zinc-500">
            {last.weight}×{last.reps}
          </span>
        )}
      </button>
    </li>
  );
}

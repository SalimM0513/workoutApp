"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import { workoutVolume } from "@/lib/stats";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ExercisePicker } from "@/components/ExercisePicker";
import { WorkoutExerciseCard } from "@/components/WorkoutExerciseCard";

export default function WorkoutPage() {
  const router = useRouter();
  const {
    hydrated,
    activeWorkout,
    startWorkout,
    endWorkout,
    cancelWorkout,
    updateWorkoutNotes,
    addExerciseToWorkout,
  } = useAppData();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    if (activeWorkout?.notes) setNotes(activeWorkout.notes);
  }, [activeWorkout?.id, activeWorkout?.notes]);

  const ensureWorkout = useCallback(() => {
    if (!activeWorkout) {
      startWorkout();
    }
  }, [activeWorkout, startWorkout]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="px-4 pt-8 text-center">
        <h1 className="text-2xl font-bold">No active workout</h1>
        <p className="mt-2 text-zinc-400">Start a session from home or below.</p>
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => {
            startWorkout();
          }}
        >
          Start Workout
        </Button>
        <Link href="/" className="mt-4 inline-block text-sm text-zinc-500">
          ← Home
        </Link>
      </div>
    );
  }

  const volume = workoutVolume(activeWorkout);
  const totalSets = activeWorkout.exercises.reduce(
    (n, e) => n + e.sets.length,
    0
  );

  const handleAddExercise = (exerciseId: string) => {
    addExerciseToWorkout(exerciseId);
    setExpandedId(exerciseId);
    setPickerOpen(false);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        document
          .getElementById(`exercise-${exerciseId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  };

  const handleEnd = () => {
    updateWorkoutNotes(notes.trim());
    endWorkout(notes.trim() || undefined);
    router.push("/");
  };

  return (
    <div className="px-4 pt-6 pb-32">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workout</h1>
          <p className="text-sm text-zinc-400">
            {totalSets} sets · {Math.round(volume).toLocaleString()} lbs volume
          </p>
        </div>
        {!confirmEnd ? (
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="min-h-[44px] rounded-xl px-3 text-sm font-medium text-accent"
          >
            Finish
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmEnd(false)}
              className="min-h-[44px] px-2 text-sm text-zinc-400"
            >
              Cancel
            </button>
            <Button size="md" onClick={handleEnd}>
              Save
            </Button>
          </div>
        )}
      </header>

      {confirmEnd && (
        <Card className="mb-4">
          <label className="mb-2 block text-sm text-zinc-400">
            Session notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel?"
            rows={3}
            className="w-full rounded-xl border border-surface-border bg-surface px-3 py-2 text-base resize-none"
          />
        </Card>
      )}

      <div className="space-y-3">
        {activeWorkout.exercises.map((entry) => (
          <WorkoutExerciseCard
            key={entry.exerciseId}
            entry={entry}
            expanded={expandedId === entry.exerciseId}
            onToggle={() =>
              setExpandedId((id) =>
                id === entry.exerciseId ? null : entry.exerciseId
              )
            }
          />
        ))}
      </div>

      {activeWorkout.exercises.length === 0 && (
        <p className="py-12 text-center text-zinc-500">
          Add your first exercise to start logging sets.
        </p>
      )}

      <div className="fixed bottom-[72px] left-0 right-0 z-40 mx-auto max-w-lg px-4 pb-2">
        <Button
          size="lg"
          variant="secondary"
          className="w-full shadow-lg"
          onClick={() => {
            ensureWorkout();
            setPickerOpen(true);
          }}
        >
          + Add Exercise
        </Button>
      </div>

      {pickerOpen && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setPickerOpen(false)}
          excludeIds={activeWorkout.exercises.map((e) => e.exerciseId)}
        />
      )}

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => {
            if (confirm("Discard this workout?")) cancelWorkout();
          }}
          className="text-sm text-zinc-500 underline"
        >
          Discard workout
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { INTENSITY_OPTIONS } from "@/lib/constants";
import {
  estimateWorkoutCalories,
  formatVolume,
  workoutVolume,
} from "@/lib/stats";
import type { Workout, WorkoutIntensity } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "./Button";
import { Card } from "./Card";
import { ExercisePicker } from "./ExercisePicker";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";

interface WorkoutSessionProps {
  workout: Workout;
  onFinish?: () => void;
  showDiscard?: boolean;
}

export function WorkoutSession({
  workout,
  onFinish,
  showDiscard = true,
}: WorkoutSessionProps) {
  const {
    endWorkout,
    cancelWorkout,
    updateWorkout,
    updateWorkoutNotes,
    addExerciseToWorkout,
    data,
  } = useAppData();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState(workout.notes ?? "");
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [intensity, setIntensity] = useState<WorkoutIntensity>(
    workout.intensity ?? data.settings.defaultIntensity
  );

  useEffect(() => {
    setNotes(workout.notes ?? "");
    setIntensity(workout.intensity ?? data.settings.defaultIntensity);
  }, [workout.id, workout.notes, workout.intensity, data.settings.defaultIntensity]);

  const volume = workoutVolume(workout);
  const totalSets = workout.exercises.reduce((n, e) => n + e.sets.length, 0);
  const isActive = data.activeWorkoutId === workout.id;
  const estimatedCal =
    confirmEnd && data.settings.showCalorieEstimate
      ? estimateWorkoutCalories(
          { ...workout, intensity },
          data.settings
        )
      : null;

  const handleAddExercise = (exerciseId: string) => {
    addExerciseToWorkout(exerciseId, workout.id);
    setExpandedId(exerciseId);
    setPickerOpen(false);
    requestAnimationFrame(() => {
      document
        .getElementById(`exercise-${exerciseId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const handleEnd = () => {
    if (workout.endedAt) {
      updateWorkout(workout.id, {
        notes: notes.trim() || undefined,
        intensity,
      });
    } else {
      updateWorkoutNotes(notes.trim(), workout.id);
      if (isActive) {
        endWorkout({ notes: notes.trim() || undefined, intensity });
      }
    }
    onFinish?.();
  };

  return (
    <div className="pb-32">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {workout.endedAt ? "Edit workout" : "Workout"}
          </h1>
          <p className="text-sm text-zinc-400">
            {totalSets} sets · {formatVolume(volume)} lbs volume
          </p>
        </div>
        {!workout.endedAt && !confirmEnd ? (
          <button
            type="button"
            onClick={() => setConfirmEnd(true)}
            className="min-h-[44px] rounded-xl px-3 text-sm font-medium text-accent"
          >
            Finish
          </button>
        ) : workout.endedAt ? (
          <Button size="md" onClick={handleEnd}>
            Save
          </Button>
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

      {confirmEnd && !workout.endedAt && (
        <Card className="mb-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Intensity (for calorie estimate)
            </label>
            <div className="flex gap-2">
              {INTENSITY_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setIntensity(o.id)}
                  className={`min-h-[44px] flex-1 rounded-xl text-sm font-medium ${
                    intensity === o.id
                      ? "bg-accent text-black"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
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
          </div>
          {estimatedCal !== null && (
            <div className="rounded-xl bg-zinc-800/50 p-3">
              <p className="text-sm font-medium text-accent">
                Estimated calories burned: ~{estimatedCal} kcal
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Rough estimate from duration and intensity (MET). Strength
                training calories vary widely — not calculated from weight ×
                reps.
              </p>
            </div>
          )}
          {data.settings.showCalorieEstimate &&
            estimatedCal === null &&
            !data.settings.bodyWeightLbs && (
              <p className="text-xs text-zinc-500">
                Add body weight in Stats → Settings to see calorie estimates.
              </p>
            )}
          <Button size="lg" className="w-full" onClick={handleEnd}>
            Save workout
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {workout.exercises.map((entry) => (
          <WorkoutExerciseCard
            key={entry.exerciseId}
            workoutId={workout.id}
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

      {workout.exercises.length === 0 && (
        <p className="py-12 text-center text-zinc-500">
          Add your first exercise to start logging sets.
        </p>
      )}

      <div className="fixed bottom-[72px] left-0 right-0 z-40 mx-auto max-w-lg px-4 pb-2">
        <Button
          size="lg"
          variant="secondary"
          className="w-full shadow-lg"
          onClick={() => setPickerOpen(true)}
        >
          + Add Exercise
        </Button>
      </div>

      {pickerOpen && (
        <ExercisePicker
          onSelect={handleAddExercise}
          onClose={() => setPickerOpen(false)}
          excludeIds={workout.exercises.map((e) => e.exerciseId)}
        />
      )}

      {showDiscard && isActive && !workout.endedAt && (
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
      )}
    </div>
  );
}

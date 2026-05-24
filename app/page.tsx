"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import {
  calculateStreak,
  dailyVolumeToday,
  formatDate,
  formatVolume,
  getLastWorkout,
  workoutVolume,
} from "@/lib/stats";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { StartWorkoutModal } from "@/components/StartWorkoutModal";

export default function HomePage() {
  const router = useRouter();
  const { data, hydrated, activeWorkout, startWorkout } = useAppData();
  const [showStart, setShowStart] = useState(false);

  const lastWorkout = getLastWorkout(data.workouts);
  const streak = calculateStreak(data.workouts);
  const todayVol = dailyVolumeToday(data.workouts);

  const handleStart = (templateId?: string) => {
    setShowStart(false);
    if (activeWorkout) {
      router.push("/workout");
      return;
    }
    startWorkout(templateId ? { templateId } : undefined);
    router.push("/workout");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-4 pt-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-accent">RepLog</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Train fast.
        </h1>
      </header>

      <Card className="mb-4 border-accent/20">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Today&apos;s volume
        </p>
        <p className="mt-1 text-3xl font-bold text-accent">
          {formatVolume(todayVol)}
          <span className="ml-1 text-base font-normal text-zinc-400">
            lbs
          </span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">weight × reps for today</p>
      </Card>

      {activeWorkout && (
        <Card className="mb-4 border-accent/30 bg-accent/10">
          <p className="text-sm text-accent">Workout in progress</p>
          <p className="mt-1 text-zinc-300">
            {activeWorkout.exercises.length} exercises ·{" "}
            {activeWorkout.exercises.reduce((n, e) => n + e.sets.length, 0)}{" "}
            sets
          </p>
          <Link href="/workout" className="mt-3 block">
            <Button className="w-full" variant="primary">
              Continue Workout
            </Button>
          </Link>
        </Card>
      )}

      <Button
        size="lg"
        className="mb-8 w-full"
        onClick={() => {
          if (activeWorkout) router.push("/workout");
          else setShowStart(true);
        }}
      >
        {activeWorkout ? "Go to Workout" : "Start Workout"}
      </Button>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Streak
          </p>
          <p className="mt-1 text-3xl font-bold text-accent">
            {streak}
            <span className="ml-1 text-base font-normal text-zinc-400">
              {streak === 1 ? "day" : "days"}
            </span>
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Workouts
          </p>
          <p className="mt-1 text-3xl font-bold">
            {data.workouts.filter((w) => w.endedAt).length}
          </p>
        </Card>
      </div>

      {lastWorkout && (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Last workout
          </p>
          <p className="mt-2 font-semibold">
            {formatDate(lastWorkout.endedAt!)}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {lastWorkout.exercises.length} exercises ·{" "}
            {formatVolume(workoutVolume(lastWorkout))} lbs volume
          </p>
          {lastWorkout.notes && (
            <p className="mt-2 text-sm italic text-zinc-500">
              &ldquo;{lastWorkout.notes}&rdquo;
            </p>
          )}
          <Link
            href={`/history/${lastWorkout.id}`}
            className="mt-3 inline-block text-sm font-medium text-accent"
          >
            View details →
          </Link>
        </Card>
      )}

      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link href="/calendar" className="text-accent">
          Calendar
        </Link>
        <Link href="/library" className="text-accent">
          Exercise library
        </Link>
      </div>

      {!lastWorkout && !activeWorkout && (
        <p className="mt-6 text-center text-zinc-500">
          Tap Start Workout to log your first session.
        </p>
      )}

      {showStart && (
        <StartWorkoutModal
          onStart={handleStart}
          onClose={() => setShowStart(false)}
        />
      )}
    </div>
  );
}

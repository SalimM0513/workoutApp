"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import {
  calculateStreak,
  formatDate,
  formatVolume,
  getLastWorkout,
  workoutVolume,
} from "@/lib/stats";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function HomePage() {
  const router = useRouter();
  const { data, hydrated, activeWorkout, startWorkout } = useAppData();

  const lastWorkout = getLastWorkout(data.workouts);
  const streak = calculateStreak(data.workouts);

  const handleStart = () => {
    if (activeWorkout) {
      router.push("/workout");
      return;
    }
    startWorkout();
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

      <Button size="lg" className="mb-8 w-full" onClick={handleStart}>
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

      {!lastWorkout && !activeWorkout && (
        <p className="text-center text-zinc-500">
          Tap Start Workout to log your first session.
        </p>
      )}
    </div>
  );
}

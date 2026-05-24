"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import { WorkoutSession } from "@/components/WorkoutSession";

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, hydrated } = useAppData();
  const workout = data.workouts.find((w) => w.id === id);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!workout || !workout.endedAt) {
    return (
      <div className="px-4 pt-8 text-center">
        <p className="text-zinc-500">Workout not found.</p>
        <Link href="/history" className="mt-4 inline-block text-accent">
          ← History
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <Link
        href={`/history/${workout.id}`}
        className="mb-4 inline-block text-sm text-zinc-400"
      >
        ← Cancel edit
      </Link>
      <WorkoutSession
        workout={workout}
        showDiscard={false}
        onFinish={() => router.push(`/history/${workout.id}`)}
      />
    </div>
  );
}

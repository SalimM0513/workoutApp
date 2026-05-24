"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/Button";
import { StartWorkoutModal } from "@/components/StartWorkoutModal";
import { WorkoutSession } from "@/components/WorkoutSession";

export default function WorkoutPage() {
  const router = useRouter();
  const { hydrated, activeWorkout, startWorkout } = useAppData();
  const [showStart, setShowStart] = useState(false);

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
        <Button size="lg" className="mt-8 w-full" onClick={() => setShowStart(true)}>
          Start Workout
        </Button>
        <Link href="/" className="mt-4 inline-block text-sm text-zinc-500">
          ← Home
        </Link>
        {showStart && (
          <StartWorkoutModal
            onStart={(templateId) => {
              setShowStart(false);
              startWorkout(templateId ? { templateId } : undefined);
            }}
            onClose={() => setShowStart(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <WorkoutSession
        workout={activeWorkout}
        onFinish={() => router.push("/")}
      />
    </div>
  );
}

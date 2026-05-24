"use client";

import { useAppData } from "@/hooks/useAppData";
import { CalendarGrid } from "@/components/CalendarGrid";

export default function CalendarPage() {
  const { data, hydrated } = useAppData();

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-8">
      <h1 className="mb-6 text-2xl font-bold">Calendar</h1>
      <CalendarGrid workouts={data.workouts} />
    </div>
  );
}

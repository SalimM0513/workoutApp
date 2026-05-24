"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getWorkoutDayKeys, getWorkoutsOnDate } from "@/lib/stats";
import type { Workout } from "@/lib/types";
import { Card } from "./Card";

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CalendarGrid({ workouts }: { workouts: Workout[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(fmt(now));

  const liftDays = useMemo(() => getWorkoutDayKeys(workouts), [workouts]);

  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const cells: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return fmt(d);
    }),
  ];

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const dayWorkouts = selected
    ? getWorkoutsOnDate(workouts, selected)
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 text-lg active:bg-zinc-700"
        >
          ‹
        </button>
        <h2 className="font-semibold">{monthLabel(year, month)}</h2>
        <button
          type="button"
          onClick={nextMonth}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 text-lg active:bg-zinc-700"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((key, i) =>
          key ? (
            <button
              key={key + i}
              type="button"
              onClick={() => setSelected(key)}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                selected === key
                  ? "bg-accent text-black"
                  : liftDays.has(key)
                    ? "bg-accent/25 text-accent ring-1 ring-accent/40"
                    : "bg-zinc-800/50 text-zinc-400"
              }`}
            >
              {parseInt(key.slice(8), 10)}
            </button>
          ) : (
            <div key={`empty-${i}`} />
          )
        )}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-accent/25 ring-1 ring-accent/40" />
          Lift day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-zinc-800/50" />
          Rest
        </span>
      </div>

      {selected && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-zinc-400">
            {new Date(selected + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {dayWorkouts.length === 0 ? (
            <p className="text-sm text-zinc-500">No workout logged.</p>
          ) : (
            <ul className="space-y-2">
              {dayWorkouts.map((w) => (
                <li key={w.id}>
                  <Link href={`/history/${w.id}`}>
                    <Card className="block active:bg-zinc-800/50">
                      <p className="font-medium">
                        {w.exercises.length} exercises ·{" "}
                        {w.exercises.reduce((n, e) => n + e.sets.length, 0)}{" "}
                        sets
                      </p>
                      {w.notes && (
                        <p className="mt-1 text-sm italic text-zinc-500 line-clamp-2">
                          {w.notes}
                        </p>
                      )}
                      <span className="mt-2 inline-block text-sm text-accent">
                        View →
                      </span>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

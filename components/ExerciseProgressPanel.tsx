"use client";

import { useState } from "react";
import type { ExerciseStats, ProgressMetric } from "@/lib/types";
import { ProgressChart } from "./ProgressChart";
import { Card } from "./Card";

const METRICS: { id: ProgressMetric; label: string }[] = [
  { id: "maxWeight", label: "Best weight" },
  { id: "e1rm", label: "Est. 1RM" },
  { id: "volume", label: "Volume" },
];

export function ExerciseProgressPanel({
  name,
  stats,
}: {
  name: string;
  stats: ExerciseStats;
}) {
  const [metric, setMetric] = useState<ProgressMetric>("maxWeight");

  return (
    <Card>
      <h3 className="font-semibold">{name}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-zinc-500">PR</p>
          <p className="font-bold text-accent">{stats.maxWeight} lbs</p>
        </div>
        <div>
          <p className="text-zinc-500">Last</p>
          <p className="font-bold">
            {stats.lastWeight}×{stats.lastReps}
          </p>
        </div>
        <div>
          <p className="text-zinc-500">Est. 1RM</p>
          <p className="font-bold">{stats.bestE1rm} lbs</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none">
        {METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMetric(m.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              metric === m.id
                ? "bg-accent text-black"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <ProgressChart stats={stats} metric={metric} />
      </div>
    </Card>
  );
}

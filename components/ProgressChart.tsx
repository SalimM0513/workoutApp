"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ExerciseStats } from "@/lib/types";

export function ProgressChart({ stats }: { stats: ExerciseStats }) {
  if (stats.history.length < 2) {
    return (
      <p className="py-4 text-center text-sm text-zinc-500">
        Log more workouts to see progress
      </p>
    );
  }

  const data = stats.history.map((h) => ({
    date: h.date.slice(5),
    maxWeight: h.maxWeight,
    volume: Math.round(h.volume),
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#18181f",
              border: "1px solid #2a2a35",
              borderRadius: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Line
            type="monotone"
            dataKey="maxWeight"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 3 }}
            name="Max weight"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

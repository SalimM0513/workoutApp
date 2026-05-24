"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ExerciseStats, ProgressMetric } from "@/lib/types";

const METRIC_CONFIG: Record<
  ProgressMetric,
  { key: keyof ExerciseStats["history"][0]; label: string; format: (v: number) => string }
> = {
  maxWeight: {
    key: "maxWeight",
    label: "Best working weight",
    format: (v) => `${v} lbs`,
  },
  volume: {
    key: "volume",
    label: "Session volume",
    format: (v) => v.toLocaleString(),
  },
  e1rm: {
    key: "bestE1rm",
    label: "Est. 1RM",
    format: (v) => `${v} lbs`,
  },
};

export function ProgressChart({
  stats,
  metric,
}: {
  stats: ExerciseStats;
  metric: ProgressMetric;
}) {
  if (stats.history.length < 2) {
    return (
      <p className="py-4 text-center text-sm text-zinc-500">
        Log more workouts to see progress
      </p>
    );
  }

  const config = METRIC_CONFIG[metric];
  const data = stats.history.map((h) => ({
    date: h.date.slice(5),
    value: h[config.key] as number,
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
            formatter={(value) => [
              config.format(Number(value)),
              config.label,
            ]}
            contentStyle={{
              background: "#18181f",
              border: "1px solid #2a2a35",
              borderRadius: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 3 }}
            name={config.label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

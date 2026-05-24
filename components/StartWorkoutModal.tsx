"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "./Button";

interface StartWorkoutModalProps {
  onStart: (templateId?: string) => void;
  onClose: () => void;
}

export function StartWorkoutModal({ onStart, onClose }: StartWorkoutModalProps) {
  const { data } = useAppData();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface-raised p-4 max-h-[80dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Start workout</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3 text-zinc-400"
          >
            Close
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSelected(null)}
          className={`mb-2 flex min-h-[52px] w-full items-center rounded-xl border px-4 text-left ${
            selected === null
              ? "border-accent bg-accent/10"
              : "border-surface-border bg-surface"
          }`}
        >
          <span className="font-medium">Empty workout</span>
        </button>

        <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">
          Templates
        </p>
        <ul className="space-y-2 mb-4">
          {data.templates.map((t) => {
            const names = t.exerciseIds
              .map((id) => data.exercises.find((e) => e.id === id)?.name)
              .filter(Boolean)
              .slice(0, 4);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`flex min-h-[52px] w-full flex-col rounded-xl border px-4 py-3 text-left ${
                    selected === t.id
                      ? "border-accent bg-accent/10"
                      : "border-surface-border bg-surface"
                  }`}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="mt-0.5 text-sm text-zinc-500 line-clamp-1">
                    {names.join(", ")}
                    {t.exerciseIds.length > 4
                      ? ` +${t.exerciseIds.length - 4}`
                      : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <Link
          href="/templates"
          onClick={onClose}
          className="mb-4 block text-sm text-accent"
        >
          Manage templates →
        </Link>

        <Button
          size="lg"
          className="w-full"
          onClick={() => onStart(selected ?? undefined)}
        >
          Start
        </Button>
      </div>
    </div>
  );
}

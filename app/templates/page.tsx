"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppData } from "@/hooks/useAppData";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ExercisePicker } from "@/components/ExercisePicker";

export default function TemplatesPage() {
  const { data, hydrated, addTemplate, updateTemplate, deleteTemplate, getExercise } =
    useAppData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  const handleCreate = () => {
    if (!newName.trim()) return;
    const t = addTemplate(newName, []);
    setCreating(false);
    setNewName("");
    setEditingId(t.id);
  };

  return (
    <div className="px-4 pt-8 pb-8">
      <Link href="/" className="mb-4 inline-block text-sm text-zinc-400">
        ← Home
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Templates</h1>
        <button
          type="button"
          onClick={() => setCreating(!creating)}
          className="min-h-[44px] text-sm font-medium text-accent"
        >
          {creating ? "Cancel" : "+ New"}
        </button>
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        Pre-load exercises when starting a workout. You can still change them
        during the session.
      </p>

      {creating && (
        <Card className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="e.g. Push Day"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-12 min-w-0 flex-1 rounded-xl border border-surface-border bg-surface px-4"
          />
          <Button onClick={handleCreate}>Create</Button>
        </Card>
      )}

      <ul className="space-y-4">
        {data.templates.map((t) => {
          const isEditing = editingId === t.id;
          const names = t.exerciseIds
            .map((id) => getExercise(id)?.name)
            .filter(Boolean);

          return (
            <li key={t.id}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{t.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {t.exerciseIds.length} exercises
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingId(isEditing ? null : t.id)
                      }
                      className="text-sm text-accent"
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${t.name}"?`))
                          deleteTemplate(t.id);
                      }}
                      className="text-sm text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {names.length > 0 && (
                  <p className="mt-2 text-sm text-zinc-500">
                    {names.join(", ")}
                  </p>
                )}

                {isEditing && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setPickerFor(t.id)}
                    >
                      + Add exercise
                    </Button>
                    <ul className="space-y-1">
                      {t.exerciseIds.map((eid) => (
                        <li
                          key={eid}
                          className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm"
                        >
                          <span>{getExercise(eid)?.name ?? eid}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateTemplate(t.id, {
                                exerciseIds: t.exerciseIds.filter(
                                  (id) => id !== eid
                                ),
                              })
                            }
                            className="text-zinc-500"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      {pickerFor && (
        <ExercisePicker
          onSelect={(exerciseId) => {
            const t = data.templates.find((x) => x.id === pickerFor);
            if (t && !t.exerciseIds.includes(exerciseId)) {
              updateTemplate(pickerFor, {
                exerciseIds: [...t.exerciseIds, exerciseId],
              });
            }
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
          excludeIds={
            data.templates.find((x) => x.id === pickerFor)?.exerciseIds ?? []
          }
        />
      )}
    </div>
  );
}

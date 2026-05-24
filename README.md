# RepLog — Workout Tracker

A mobile-first workout logging web app built with Next.js. Optimized for **fast set logging** (under 3 seconds) with autofill, quick weight increments, and minimal taps.

## Features

- **Workout sessions** — start, add exercises, log sets (weight + reps), end with optional notes
- **Exercise library** — 20+ default exercises by muscle group + custom exercises
- **Fast set logging** — previous workout autofill, ±5 lb buttons, +2.5/+5/+10 shortcuts
- **Progress** — per-exercise PRs, last performance, charts (Recharts)
- **History** — browse past workouts with full set details
- **Stats** — weekly workouts/volume, streak, all-time volume

Data is stored in **localStorage** (no backend). The storage layer in `lib/storage.ts` and types in `lib/types.ts` are structured so you can swap in a database later.

## Run locally

```bash
cd Projects/workout-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone (same Wi‑Fi) or use responsive mode in DevTools.

## Deploy to Vercel

1. Push this repo to GitHub (or import the folder in Vercel).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Deploy — no env vars required.

Or use the CLI:

```bash
npm i -g vercel
vercel
```

## Project structure

```
app/              # App Router pages (Home, Workout, History, Stats)
components/       # UI: SetLogger, ExercisePicker, charts, nav
hooks/            # useAppData — central state + localStorage sync
lib/
  types.ts        # Domain types (ready for DB schema)
  storage.ts      # load/save localStorage
  stats.ts        # volume, streaks, PRs, history
  constants.ts    # default exercises, muscle groups
```

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 3
- Recharts (lightweight progress charts)
- TypeScript

## Tips for fastest logging

1. Start a workout from **Home**.
2. **Add Exercise** → pick one (last session values autofill).
3. Tap **Log Set** — adjust weight with +5 or chips, reps with ±1.
4. Expand another exercise or add more without leaving the screen.

---

Built for daily use. No account required.

# RepLog — Workout Tracker

A mobile-first workout logging web app built with Next.js. Optimized for **fast set logging** (under 3 seconds) with autofill, quick weight increments, and minimal taps.

## Features

### Core
- **Workout sessions** — start, add exercises, log sets (weight + reps), end with optional notes
- **Fast set logging** — previous workout autofill, ±5 lb buttons, +2.5/+5/+10 shortcuts, full manual entry for weight and reps
- **localStorage** — all data stays on your device (no backend)

### Exercise library
- Browse all exercises (defaults + custom)
- **Add exercises anytime** from the Library tab (`/library`)
- Per-exercise history: last working sets, PRs, and progress graphs
- Autofill latest weight/reps when you select an exercise in a workout

### Progress graphs
- Per-exercise charts: **best working weight**, **estimated 1RM** (Epley), or **session volume**
- Updates automatically when you complete workouts with that exercise

### Workout history
- View past workouts with full set details
- **Edit** saved workouts (add/remove exercises, add/edit/remove sets)
- **Delete** workouts

### Daily volume
- **Today’s volume** (weight × reps) on Home and Stats — no weekly/all-time volume on the main dashboard

### Calendar
- Month view showing **lift days** vs rest days
- Tap a day to see workouts from that date

### Workout templates
- Built-in templates: Push, Pull, Legs, Upper, Lower
- Create custom splits (e.g. Push Day) with pre-selected exercises
- Start a workout from a template — exercises load automatically; you can still edit during the session
- Manage templates at `/templates`

### Estimated calories (optional)
- Rough estimate from **duration + intensity + body weight** (MET-based)
- Clearly labeled as approximate — **not** calculated from weight × reps
- Configure body weight and default intensity in **Stats → Settings**

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

## Project structure

```
app/
  page.tsx              # Home — today's volume, start workout
  workout/              # Active session
  calendar/             # Lift calendar
  history/              # Past workouts + edit
  stats/                # Daily volume, settings, progress
  library/              # Exercise library + per-exercise detail
  templates/            # Workout templates
components/             # SetLogger, WorkoutSession, charts, calendar
hooks/useAppData.tsx    # State + localStorage sync
lib/
  types.ts              # Domain types (v2)
  storage.ts            # load/save + migration from v1
  stats.ts              # volume, streaks, PRs, calories
  workout-mutations.ts  # Workout CRUD helpers
```

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 3
- Recharts
- TypeScript

## Tips for fastest logging

1. **Home** → **Start Workout** (pick a template or empty).
2. **Add Exercise** or use template exercises — last session values autofill.
3. Type exact weight/reps or use ± buttons → **Log Set**.
4. **Finish** → optional notes and intensity for calorie estimate.

---

Built for daily use. No account required.

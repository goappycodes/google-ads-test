# Google Ads — Practice Simulator

A self-contained, password-protected training sandbox that looks and behaves like
Google Ads, for building a Google **Search** campaign end to end — **without** a
real Google Ads account, billing, Performance Max pressure, or anything
publishable. Built for the ALLEN Siliguri "JEE dropper batch" exam brief, but
usable for any Search-campaign practice.

All work is saved in the browser's **localStorage**, so nothing is lost on
refresh. There's a JSON **export/import** backup in the top bar.

> This app was split out of the main NEXIS website into its own repo so it can be
> hosted and deployed independently.

## Access

The builder is behind a client-side access code:

```
allen2027
```

(It's a keep-casuals-out gate — there's no sensitive data behind it; everything
lives only in the visitor's own browser.)

## What it covers

- **Keyword Planner** — JEE/ALLEN keyword ideas with avg. monthly searches,
  top-of-page bid ranges, competition and a 12-month trend, toggleable between
  Siliguri and all-India.
- **Campaign construction** — objective, type, bidding & networks, locations
  (incl. location options and radius targeting), languages & ad schedule, ad
  groups + keywords with match types, negative keywords, responsive search ads
  with a live "Sponsored" preview, assets (call and optional image), daily
  budget with working, and a review step (publishing is disabled).
- **Conversions** — create a conversion action (name/category/counting).
- **Exam guide** — the brief's facts and a checklist mapping each requirement to
  where it's done, plus an HTML submission report.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

## Stack

Next.js 14 (App Router) · React 18 · TypeScript. The simulator UI is fully
self-contained under `components/ads-simulator/` with its own scoped CSS and
locally bundled Google Sans / Roboto fonts. No external services are required.

## Deploy

Any Next.js host works (e.g. Vercel). It's a standard Next.js app with no
environment variables or backend.

## Exam instructions and content protection

The opening Exam guide is the complete student handout: scenario,
90-minute workflow, campaign rationale, rules, and HTML-report
submission to madhu@nexisschool.com. Student identification uses a name only;
there is no roll-number field. Reports are named Name_MidSem.html.

Clipboard operations, text drops, printing and page save/source shortcuts are
blocked inside the simulator. A student-name/time watermark overlays the UI.
The brief is hidden after focus/visibility changes and recognised capture keys
until the student selects Resume exam. These are browser-level deterrents;
OS screenshots, phone photos and browser menus cannot be reliably prevented.

Focused checks: `node --test scripts/exam-protection.test.cjs`.

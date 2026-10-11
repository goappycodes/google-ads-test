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
  with a live "Sponsored" preview, assets (sitelinks/callouts/call/image), daily
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
self-contained under `components/ads-simulator/` with its own scoped CSS — no
Tailwind, fonts, or external services required.

## Deploy

Any Next.js host works (e.g. Vercel). It's a standard Next.js app with no
environment variables or backend.

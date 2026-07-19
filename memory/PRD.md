# Get My Cover — Comparison Tool PRD

## Original Problem Statement
Interactive web app that compares insurance from multiple providers.

## Refactor (Feb 2026)
Rebuilt as a **static, backend-less comparison tool** for Get My Cover (NZ), rendering exclusively from `gmc_tool_data.json` per attached brand kit.

## Data & Compliance
- Source: bundled `/app/frontend/src/data/gmc_tool_data.json` (5 NZ insurers × 25 features per insurer, ~125 cells)
- Each cell shows: value + source citation (doc · version · page) + verified/pending badge
- **No pricing, no ratings, no reviews, no stars, no scores, no "Most Popular"** — compliance rule, not preference
- Voice: "describe, never recommend"
- Standing disclaimer on every view

## Design system (from `gmc_brand_kit.md`)
- Typography: Plus Jakarta Sans (400–900)
- Palette: teal `#14B5AF` primary, deep teal `#006A66`, teal gradient buttons — **never green**
- All tokens as CSS variables under `--gmc-*` in `/app/frontend/src/index.css`
- Nav: frosted glass rgba(255,255,255,.75) + backdrop-blur(14px)
- Radii: card 24px, control 12px, chip 9999px

## Architecture
- **Backend**: minimal FastAPI stub (present only so supervisor stays healthy — the tool never calls it)
- **Frontend**: React (CRA) + Tailwind + Shadcn UI, single route
- Ships as static bundle via `yarn build` — 92.3KB JS + 10.6KB CSS gzipped

## Components (`/app/frontend/src/components/`)
- `GmcNav.jsx` — frosted-glass sticky header with compact CTA
- `Hero.jsx` — teal-deep hero with tagline + CTA
- `ProductTypeSelector.jsx` — 5 product types, only Health enabled; others show "Soon"
- `InsurerPicker.jsx` — 5 insurer cards, pick 2–3
- `ComparisonTable.jsx` — grouped rows (6 groups), collapsible, differences-only toggle, sticky header, teal-tint on diff rows
- `CTA.jsx` — `.gmc-btn-primary.gmc-quote-trigger` (no onClick — parent site's global modal binds to the class)
- `TrustStrip.jsx` — "Free & no obligation · Advisers are paid by the insurer, never by you"
- `Disclaimer.jsx` — standing footer disclaimer

## CTA pattern
- Class-only trigger: `<button class="gmc-btn-primary gmc-quote-trigger">…</button>`
- In this preview only: a document-level delegated listener (`App.js`) fires a Sonner toast so reviewers can see the click was received. It's not attached to the button element.

## Implemented (v2.0 — Feb 2026 refactor)
- ✅ All prohibited elements removed (prices, ratings, badges, pros/cons)
- ✅ JSON bundled at build time
- ✅ Product-type selector (Health live; Life/Trauma/Income/Mortgage placeholder)
- ✅ Insurer multi-select (2–3 constraint)
- ✅ Comparison table with collapsible groups + differences-only toggle
- ✅ Verified / Pending badges per cell
- ✅ Standing disclaimer + trust strip
- ✅ Static bundle verified via `yarn build`
- ✅ Zero banned words in code

## Backlog

### P1
- Wire live products for Life / Trauma / Income Protection / Mortgage Protection when data lands
- Verified-date badges once human audit is complete (currently all "Pending verification" per data source)
- Deep-link a comparison (URL params → preselected insurers)

### P2
- Print-friendly comparison view (print stylesheet)
- Export comparison as PDF via client-side (no server)
- i18n (te reo Māori labels)
- Feature-level bookmarks (permalink to a specific row)

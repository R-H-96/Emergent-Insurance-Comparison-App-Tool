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

## Implemented (v5.0 — Feb 2026 sticky nav, ask engine, shareable state)
- ✅ v3 JSON refreshed with new accents (SC `#0079C2`, nib `#6CC24A`, AIA `#D0103A`, PL `#1D4A44`, UniMed `#1C2B54`) and per-insurer `sources[]` with real URLs
- ✅ New nib logo replaced and whitespace-trimmed (matching the other logo pipeline)
- ✅ All colours read from JSON — no hardcoded hexes remain in components
- ✅ **Column tinting**: each insurer table column gets a ~5% opacity wash of its accent (`hexToRgba(accent, 0.05)`) making columns trackable at a glance
- ✅ **Notable row marker changed**: full-row teal fill replaced with a 3px teal inset left-edge marker (`.gmc-notable-row`) — subtler and doesn't fight column tints
- ✅ **Sticky tool nav** (`ToolNav.jsx`): appears once the picker scrolls out of view. Desktop shows three tab buttons (At a glance / Full comparison / Ask a question) that smooth-scroll to the corresponding anchors, plus the selected insurers as small overlapping logo chips outlined in each accent, and a "Change" button that scrolls back to the picker. Mobile replaces this with a floating pill button (bottom-right) that opens a bottom **Sheet** containing the InsurerPicker and group FilterChips
- ✅ **Ask a question engine** (`AskAQuestion.jsx` + `lib/askEngine.js`): deterministic client-side keyword matcher over feature names, definitions, why-lines, short/detail cells, and glossary terms. Canonical synonym map (adhd→mental, mri→imaging, pharmac→non-pharmac, gp→day-to-day, etc.) is flat-split so multi-word canonicals score correctly. UX: ~800ms shimmer, then either a result card (feature match with per-insurer short + accent stripes + "Show me in the table" + "Read the full detail" + "Ask another" buttons) or the adviser fallback. All questions logged to `localStorage.gmc_feedback_questions`
- ✅ **Row locate/flash**: "Show me in the table" scrolls to `row-<slug>` (auto-expands the containing group and clears filters that would hide it), then applies a 2.3s `.gmc-flash` animation to draw the eye
- ✅ **Detail modal sources**: `SOURCE` block now renders each entry in `insurer.sources[]` as an underlined `<a target="_blank">` with an `ExternalLink` icon; the JSON's original cell-level `source` text is kept as a smaller "Cited passage" line
- ✅ **At-a-glance outlined CTA**: "Read the full detail →" rendered as a `.gmc-btn-outline` button with hover fill; whole card is a role="button" with hover lift + pointer cursor + keyboard support
- ✅ **Shareable URL state**: `?product=&insurers=sc,nib&diff=1&groups=Core%20limits` — restored on load, updated via `history.replaceState` on every state change; "Copy link" button in the table header uses `navigator.clipboard.writeText`
- ✅ **Persistent selection**: `localStorage.gmc_last_selection` (`insurers`, `diffOnly`, `activeGroups`, `savedAt`) — URL wins over storage wins over defaults
- ✅ **"[N] notable differences found" chip** next to the At a glance heading (currently 9)
- ✅ **Mobile pass**: 44px min tap targets via `.gmc-tap`, bottom-sheet picker (shadcn Sheet), fixed bottom "Talk to an adviser — free" CTA, stacked-card table retained; bottom spacer prevents footer overlap
- ✅ Static bundle rebuilt cleanly

## Implemented (v4.0 — accents, logos, glossary, feedback)
- ✅ v3 JSON bundled: per-insurer `accent` hexes (SC blue, nib green, AIA red, PL burgundy, UniMed teal-blue) and `logo` paths; per-feature `why`; per-cell `detail_points`; global `glossary` object (15 terms)
- ✅ Real insurer logos extracted from supplied zip, trimmed with PIL, saved to `/app/frontend/public/logos/{sc,nib,aia,pl,uni}.png`; served via `<InsurerLogo>` in uniform tiles with initial-tile fallback
- ✅ **Accent colours** consistently applied: picker card border/text (selected), at-a-glance mini-block left stripe + insurer name, table column-header top stripe + name, detail-modal left stripe + name
- ✅ **Detail modal bullets**: full text rendered from `detail_points` as `<ul>` (falls back to `detail` if points missing)
- ✅ **At-a-glance `why` line**: italic muted sentence rendered under the per-insurer value grid
- ✅ **Glossary mechanism**: `<GlossaryText>` parses `{term}` markers → dotted-underline `<button>` opens a shadcn Popover with the term + definition (mobile-friendly, keyboard-focusable). No markers in current text so rendering is unchanged; ready for future edits.
- ✅ **Feedback input** ("Can't find what you're looking for?"): text input stores to `localStorage.gmc_feedback_questions`; on submit shows "Good question — that's one for an adviser" + `.gmc-quote-trigger` button
- ✅ **`?embed=1&groups=X,Y`** URL parsing (App.js): validates group names against JSON, pre-opens only those groups in the table (other groups remain browsable via chevron)
- ✅ Compliance preserved: no ratings/prices/badges, `.gmc-quote-trigger` still class-only, embed disclaimer now also carries the required "Insurer logos are used to identify… independent…" line
- ✅ Static bundle rebuilt cleanly

## Implemented (v3.0 — layered UX)
- ✅ v2 JSON schema bundled (`short`/`detail` per cell, `notable` per feature, `schema_version: 2`)
- ✅ **Layer 1 — At a glance**: one card per notable feature (8), each with definition + per-insurer short value + verified icon; clicking opens detail modal
- ✅ **Layer 2 — Table**: cells show ONLY `short` + tiny verified/pending icon; Core limits open by default, all others collapsed; "Notable differences only" toggle filters to `notable: true`; group filter chips (All + one per group); no horizontal scroll (stretches to container); mobile (<md) renders as stacked cards per feature
- ✅ **Layer 3 — Detail modal**: opens on click of any at-a-glance card / table row / mobile row; shows group eyebrow, feature name, definition, per-insurer blocks (product, short-value pill, full `detail`, dotted-underline source citation, verified/pending badge), and a bottom `.gmc-quote-trigger` CTA labelled "Ask an adviser — free"
- ✅ **`?embed=1` mode**: strips GmcNav, Hero, footer CTA card, and full standing Disclaimer; replaces with compact inline disclaimer to preserve compliance. Detected via `URLSearchParams` in `App.js`, propagated via `embed` prop to `ComparePage`
- ✅ Static bundle rebuilt: 116KB JS + 10.9KB CSS gzipped
- ✅ Brand kit unchanged: Plus Jakarta Sans, `#14B5AF` teal, no green, no prices/ratings/badges

## Implemented (v2.0 — refactor)
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

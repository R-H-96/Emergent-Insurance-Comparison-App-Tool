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

## Implemented (v7.0 — Feb 2026 unified surface, control dock, HubSpot beacon)
- ✅ **Merged surface** (`ComparisonSurface.jsx`): Sticky pill segmented control [At a glance | Full comparison]. Same component tree at two densities — glance renders `AtAGlance` (only pair-notable cards), full renders `ComparisonTable`. Density toggle uses `framer-motion` `AnimatePresence mode="wait"` + `layout` for crossfade + auto-height. Respects `useReducedMotion()`. Density persisted in URL (`?density=`) + localStorage; pushes `gmc_density_toggle` to `dataLayer` on every change (skipping the initial mount)
- ✅ **Direct-manipulation control dock** (`ControlDock.jsx`, ≥1200px): floating right rail with **no anchor links**. Insurer icon opens a `Popover` containing `ProductTypeSelector` + `InsurerPicker` (edits apply live). Each individual insurer chip is its own dock button that reopens the same popover. Filter icon opens a `Popover` with group `FilterChips` + Notable-only toggle. Ask icon toggles the floating `AskPanel` drawer. Share icon triggers `navigator.share()` / clipboard.
- ✅ **AskPanel** (`AskPanel.jsx`): desktop drawer (~380px, bottom-right) or mobile bottom `Sheet`. Header, close button, ask input with rotating placeholder, deterministic engine (shimmer/match/nomatch), and a **session history** feed (matched features get inline "Show me" / "Full detail" buttons; unmatched are logged with an adviser note). History held in `useAskEngine` state (up to 20 items)
- ✅ **Removed** the bottom "Can't find what you're looking for?" section entirely — the compact ask bar (mobile) and floating panel replace it
- ✅ **Mobile action bar** (`MobileBottomBar.jsx`, <1200px): single fixed bottom bar with three slots — Compare (opens picker + filters `Sheet`), Ask (opens `AskPanel` as bottom `Sheet`), and an accent-filled "Adviser — free" button carrying `.gmc-quote-trigger`. Replaces the old floating pill + separate CTA.
- ✅ **Insurer strip** (`InsurerStrip.jsx`) at the top of the comparison surface: "COMPARING" label + accent-outlined insurer chips + "Change" button that opens the same picker popover (`onOpenPicker`)
- ✅ **Preserved every prior behaviour**: pair-aware notability, glossary popovers with `{term}` markers, detail modals with linked sources, share, all six analytics events (`gmc_select_insurers`, `gmc_group_open`, `gmc_modal_open`, `gmc_question_asked`, `gmc_cta_click`, `gmc_share`) plus the new `gmc_density_toggle`, URL/localStorage sync, embed mode, print stylesheet (auto-prints the Full comparison because Ask/dock/mobile-bar all `print:hidden`)
- ✅ **HubSpot beacon**: `FEEDBACK_ENDPOINT` set to the supplied HSForms URL. Payload wraps `{fields:[{objectTypeId:"0-1",name:"question_text",...},{name:"matched_feature",...},{name:"page_path",...}], context:{pageUri, pageName}}`. Verified end-to-end: curl 200 for JSON, browser fetch returned 200, `[gmc feedback] 200` logged. Uses `fetch(...{mode:"cors", credentials:"omit", keepalive:true})` — sendBeacon can't set application/json and HubSpot rejects text/plain (415).

## Implemented (v6.0 — pair-aware notability, ask v2, right rail, analytics)
- ✅ v4 JSON bundled — every cell now carries a `signal` (normalized value), features have `synonyms[]`, and there are 8 rotating `example_questions`. Glossary markers now live in the copy (features definition/why + cell detail_points contain `{term}` tokens like `{Pharmac}`, `{Medsafe}`, `{specialist}`)
- ✅ **Pair-aware "Notable only"** (`lib/notable.js`): a row is notable *for the current selection* when `feature.notable === true` AND the selected insurers' `signal` values differ. Drives the toggle filter, the At-a-glance card list, and the "[N] notable differences found" chip (SC vs AIA → 8; SC vs Partners Life → 9)
- ✅ **Ask-engine v2** (`lib/askEngine.js`): synonym phrases loaded from JSON per feature (`+5` for phrase-in-question), then token scoring against feature name (+3) / group (+2) / corpus incl. glossary mentions (+1). Case-insensitive throughout. Damerau-lite Levenshtein (edit distance ≤2) applied to any token of ≥5 letters — so "pshycology" → Mental health, "surgey" → Surgical benefit maximum
- ✅ **Rotating placeholder** (`useRotatingPlaceholder`): both ask inputs cycle through `example_questions` every 3.5s, prefixed "Try: '…'"; paused on focus
- ✅ **Compact ask bar** (`AskCompact.jsx`): placed directly under the insurer picker; shares the same `useAskEngine` state with the full section and smooth-scrolls the user to the result
- ✅ **Live glossary markers**: `GlossaryText` unchanged behaviour, but I added `stopPropagation` on the marker button so clicking inside a clickable at-a-glance card / row opens the popover (not the row's modal)
- ✅ **Desktop right-side rail** (`ToolNav.jsx` ≥1200px): floating vertical dock with `Sparkles / Table2 / MessageCircleQuestion` icon buttons (labels slide out on hover), then the selected-insurer logo chips outlined in accent (click = scroll back to picker), then a Share icon. Appears once the picker leaves the viewport; ≤1199px falls back to the existing mobile floating pill + bottom sheet.
- ✅ **Share**: `navigator.share()` where available (mobile), clipboard fallback with "Copied!" toast + `gmc_share` analytics event on both paths
- ✅ **Ask sendBeacon**: `FEEDBACK_ENDPOINT` constant at the top of `hooks/useAskEngine.js` (currently empty string → disabled). Once you paste a Formspree URL in it, every ask fires `navigator.sendBeacon(FEEDBACK_ENDPOINT, {question, matched_feature, path, timestamp})` — fire-and-forget, no personal data. localStorage logging preserved.
- ✅ **Analytics dataLayer** (`lib/analytics.js`): `pushEvent` ensures `window.dataLayer` exists and pushes `{event, ts, ...payload}`. Events wired: `gmc_select_insurers`, `gmc_group_open`, `gmc_modal_open`, `gmc_question_asked` (with `matched: boolean`), `gmc_cta_click`, `gmc_share`
- ✅ **Trust line** (`TrustLine.jsx`): above the comparison table — reads all `verified` fields to find the latest ISO date, otherwise "Verification in progress" · `How we compare →` link placeholder to `/compare/how-we-compare`
- ✅ **Polish**: shadcn Dialog already provides focus trap + ARIA; added `aria-label` on ask inputs, `aria-live="polite"` on ask result cards, keyboard support on cards. Print stylesheet (`@media print`) hides nav/hero/rail/mobile-pill/asks/CTAs and prints the comparison table with a black inset marker for notable rows

## Implemented (v5.0 — sticky nav, ask engine v1, shareable state)
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


## Implemented (v6.0 — Refinement Round, Feb 20 2026)
- ✅ **New reusable `MobileSheet`** (`/app/frontend/src/components/MobileSheet.jsx`) — Framer-motion drag-to-dismiss (120px OR velocity 500), backdrop tap, browser-back closure via History API (StrictMode-safe with 150ms guard), body scroll lock with scrollbar-width compensation, ESC key close, sticky branded header with drag handle + eyebrow + title + single X, safe-area-inset-bottom footer padding, portal to document.body
- ✅ **DetailModal**: Dialog on desktop; MobileSheet on `<768px` — sticky header stays visible, footer CTA docks to bottom with safe-area inset, sources & detail bullets kept intact
- ✅ **AskPanel**: mobile now uses MobileSheet (removes duplicate X from previous Shadcn Sheet); desktop drawer max-width bumped to 420px; input 48px min-height and 16px font-size
- ✅ **MobileBottomBar**: safe-area-inset-bottom padding, hidden (aria-hidden + translated off-screen) while any sheet is open; compare sheet uses MobileSheet with title "Change comparison" (no truncation) + Done footer
- ✅ **ControlDock**: buttons w-14 h-14 (~30% wider), icons only with hover tooltips, larger 34px logo chips with accent outline, z-index 60 (< 100). Insurer popover 600px wide showing full picker cards; filter popover shows FilterChips with filled variant + 38x22 .gmc-toggle for notable-only
- ✅ **FilterChips**: new `filled` prop — active = teal fill + white text; inactive = neutral outlined; mutual exclusion between "All groups" and individual groups
- ✅ **ComparisonSurface**: sticky segmented control now respects `--gmc-sticky-offset` CSS var; z-index 40
- ✅ **ComparisonTable**: proper empty state ("No rows in this group for this pair.") with `Clear filters` button (`comparison-empty-clear`) that resets group + notable-only filters
- ✅ **iOS anti-zoom**: global CSS forces text/search/email/tel/url/number/textarea/select to 16px font-size on `<768px`
- ✅ **A11y**: global `:focus-visible` teal ring on all interactive elements
- ✅ **SEO safety**: `<meta name="robots" content="noindex, nofollow">` added to `public/index.html`
- ✅ Testing agent (iteration_2) — 35+ checks, 100% pass on both mobile (390x844) and desktop (1440x900) viewports


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

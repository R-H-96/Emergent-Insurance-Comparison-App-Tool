# GMC Comparison Tool, Handover

A **100% static React** insurance-comparison tool (no backend). Reads a bundled JSON, renders a highly-polished compliance-strict comparison surface, and hands a minimal context snapshot to the host site when the user clicks any adviser CTA.

---

## 1. Architecture at a glance

```
┌─────────────────────────────────────────────────────────────────────┐
│  gmc_tool_data.json  (single source of truth, bundled at build time)│
└──────────────────────────────────┬──────────────────────────────────┘
                                   ▼
                       ComparePage  (state hub)
                                   │
    ┌────────────┬─────────────────┼─────────────────┬─────────────┐
    ▼            ▼                 ▼                 ▼             ▼
 GmcNav      InsurerPicker   ComparisonSurface   AskPanel     MobileBottomBar
 Hero        ProductType     ├── InsurerStrip    AskCompact   ControlDock
 Disclaimer                  ├── AtAGlance       AskLaunchBubble           │
                             ├── ComparisonTable                            │
                             └── FilterChips                                │
                                                                            ▼
                                                                     DetailModal
                                                                     (MobileSheet on <768px)
```

* **Framework**: React 19 + CRA / craco (build only, no dev server needed)
* **Styling**: Tailwind + shadcn/ui + a small brand-token CSS layer (`index.css`)
* **Motion**: `framer-motion` (bottom-sheet drag, morph transitions, staggered reveals)
* **State**: pure React (`useState` / `useMemo`), persisted to `localStorage` + `URLSearchParams`
* **Data**: bundled JSON (see below). No fetch, no backend, no DB.
* **Deploy**: static build → GitHub Pages via the workflow at `.github/workflows/build.yml`

---

## 2. Data, `frontend/src/data/gmc_tool_data.json`

Single JSON, imported at build time. Shape:

```jsonc
{
  "version": "4",
  "product_types": [ "Health", "Life", "Trauma", ...],   // used by ProductTypeSelector
  "insurers": [
    { "id": "sc",  "name": "Southern Cross", "product": "Wellbeing Two",
      "version": "Policy document, effective 1 Apr 2026",
      "accent": "#0079C2", "sources": [{ "label": "...", "url": "..." }] },
    ...
  ],
  "features": [
    { "feature": "Surgical benefit maximum", "group": "Core limits",
      "definition": "The most the policy pays..." }, ...
  ],
  "data": {
    "sc":  [ { "feature": "...", "short": "...", "detail": "...",
               "detail_points": ["..."], "source": "...", "verified": true }, ... ],
    "nib": [ ... ], "aia": [...], "pl": [...], "uni": [...]
  },
  "glossary": { "term": { "short": "definition ...", "long": "..." } },
  "example_questions": [ "Is counselling covered?", "..." ]
}
```

Data flow:

1. `ComparePage` imports the JSON directly and builds a `lookup[insurerId][featureName]` map.
2. Selected insurers, filters, and density mode are read from `URLSearchParams` (share link), then fall back to `localStorage.gmc_last_selection`, then to defaults (`sc`, `nib`).
3. Everything downstream is a pure function of those pieces of state.

To add data: **only** edit `gmc_tool_data.json`. No code change required for new insurers, features, groups, or glossary terms. The only exception is the circular-mark PNG set (see §3).

---

## 3. Component catalog

### Page

| File | Purpose |
|---|---|
| `pages/ComparePage.jsx` | State hub. Reads/writes URL + localStorage, computes derived data, mounts every other component. |

### Chrome / layout

| File | Purpose |
|---|---|
| `components/GmcNav.jsx` | Top nav (hidden in `?embed=1`). |
| `components/Hero.jsx` | Above-the-fold intro (hidden in `?embed=1`). |
| `components/Disclaimer.jsx` | Footer legal text. |

### Selection controls

| File | Purpose |
|---|---|
| `components/ProductTypeSelector.jsx` | Choose Health / Life / etc. Only Health is live today. |
| `components/InsurerPicker.jsx` | Full picker (5-card grid; wordmark logo + name + product + version). Used inline on mobile + inside the main picker. |
| `components/InsurerStrip.jsx` | Slim "Comparing" strip above the surface. Circular mark + name chip, inline `Change` button. |

### Comparison surface

| File | Purpose |
|---|---|
| `components/ComparisonSurface.jsx` | Owns the At-a-glance ⇄ Full-comparison morph. Sticky density switch (respects `--gmc-sticky-offset`). |
| `components/AtAGlance.jsx` | 9-most-notable card grid, one card per feature. Circular marks + FeatureIcon per card. |
| `components/ComparisonTable.jsx` | Group-collapsible full table. Desktop 4-col grid; mobile stacked-card layout. |
| `components/FilterChips.jsx` | Group filter. `filled` variant renders active = accent fill / white text. |
| `components/GlossaryText.jsx` | Substrings from `glossary` become dotted-underlined popover triggers. |
| `components/VerifiedBadge.jsx` | Tiny "Verified"/"Pending verification" pill. |

### Logos

| File | Purpose |
|---|---|
| `components/InsurerLogo.jsx` | Rectangular **wordmark** (from `public/logos/{id}.png`). Wide contexts only: `InsurerPicker` cards, table column headers. |
| `components/InsurerMark.jsx` | **Circular** mark. `sc/nib/aia` → PNG from `public/logos/marks/{id}.png`. `pl/uni` → accent-coloured circle with white initials. Sizes: 40 rail, 32 modal, 28 chip, 20 inline. |

### Detail

| File | Purpose |
|---|---|
| `components/DetailModal.jsx` | Feature detail. **Desktop** → Radix `Dialog`. **Mobile (<768px)** → `MobileSheet`. Renders per-insurer blocks with 32px InsurerMark, sources, cited passages, CTA. |
| `components/MobileSheet.jsx` | Reusable bottom sheet: Framer-motion drag-to-dismiss, backdrop tap, ESC, browser-back closure (History API, StrictMode-safe 150 ms guard), body scroll lock, safe-area-inset footer. |
| `components/FeatureIcon.jsx` | 25-item explicit lucide icon map. Used in At-a-glance, Full Comparison rows, and DetailModal titles. |

### Ask

| File | Purpose |
|---|---|
| `components/AskCompact.jsx` | Inline search bar above "The things people usually ask about". |
| `components/AskPanel.jsx` | Desktop drawer (420 px, anchored bottom-right); mobile → `MobileSheet`. |
| `components/AskLaunchBubble.jsx` | Desktop-only bottom-right chat bubble launcher (56 × 56, teal gradient). |
| `hooks/useAskEngine.js` | Client-side fuzzy match against the feature list + glossary. Emits `gmc_question_asked` beacons. |
| `hooks/useRotatingPlaceholder.js` | Rotates example queries in the empty input. |
| `lib/askEngine.js` | Pure matching logic (tokenise + score). |

### Control docks

| File | Purpose |
|---|---|
| `components/ControlDock.jsx` | Desktop (>=1200 px) right rail. Three actions: change insurers, filter, share. Toggle-to-close popovers, click-away close, 16 px viewport gap. |
| `components/MobileBottomBar.jsx` | Mobile bottom bar (<1200 px). Compare / Ask / Adviser. Safe-area-inset-bottom padded. Hides when any sheet is open. |

### Hooks & libs

| File | Purpose |
|---|---|
| `hooks/useMediaQuery.js` | SSR-safe `matchMedia` hook. |
| `hooks/useCompareContextBridge.js` | **Context bridge**. Capture-phase click listener on `.gmc-quote-trigger` (see §4). |
| `lib/notable.js` | Pair-aware notability engine: which rows are worth highlighting for the current insurer pair. |
| `lib/analytics.js` | `pushEvent(name, payload)` → `window.dataLayer`. |

### UI primitives

`components/ui/*`. Vanilla shadcn (Dialog, Popover, Sheet, Button, Command, etc.). Reused verbatim.

---

## 4. Embed contract (for the host site)

The tool is embed-ready. Everything the host needs to know:

### 4.1 `?embed=1`

* Hides `GmcNav` and `Hero`.
* Trims top padding so the app fits below the host site's chrome.

### 4.2 `--gmc-sticky-offset` (CSS variable)

* The sticky density switch in `ComparisonSurface` uses `top: var(--gmc-sticky-offset, 0px)`.
* If the host has a fixed nav that would cover it, set on the iframe wrapper or the `<html>` element:
  ```css
  :root { --gmc-sticky-offset: 72px; } /* height of host's fixed header */
  ```

### 4.3 `.gmc-quote-trigger`

* Any element carrying this class is treated as an adviser CTA (compare-to-quote hand-off).
* All existing CTAs already have it: `<CTA>` component, MobileBottomBar's Adviser button, GmcNav's "TALK TO AN ADVISER".
* On click, the context bridge (`useCompareContextBridge`) writes to `localStorage`. If the host provides its own CTA, adding this class opts it in.

### 4.4 `localStorage.gmc_compare_context`

The **only** state the tool writes for the host. Privacy-restricted. No questions, no filters, no browsing state.

```js
{
  "product": "Health",
  "insurers": [
    { "id": "sc",  "name": "Southern Cross", "product": "Wellbeing Two" },
    { "id": "nib", "name": "nib",            "product": "Ultimate Health (Base)" }
  ],
  "timestamp": "2026-02-21T09:12:41.123Z"
}
```

The host site handles all consent UI. The tool does **no** consent gating itself. Read it, use it to pre-fill a HubSpot form, and clear it after submit.

Also present, unchanged:

* `localStorage.gmc_last_selection`. Internal use only (persists user's last chosen insurers + filters + density between visits).

---

## 5. Analytics events

Pushed to `window.dataLayer` via `lib/analytics.js`. GTM / HubSpot / Segment can pick them up.

| Event | Payload | Fired when |
|---|---|---|
| `gmc_select_insurers` | `{ insurers: string[] }` | User adds/removes an insurer |
| `gmc_group_open` | `{ group: string }` | Group section expanded in Full Comparison |
| `gmc_modal_open` | `{ feature: string }` | DetailModal opened |
| `gmc_question_asked` | `{ question: string, matched: boolean, feature?: string }` | Ask submitted |
| `gmc_cta_click` | `{ label: string, feature?: string }` | Any `<CTA>` clicked (adviser button) |
| `gmc_share` | `{ url: string }` | Share button pressed |
| `gmc_density_switch` | `{ mode: "glance"\|"full" }` | Density segmented control toggled |

Every event also carries an auto-injected `ts` (ISO timestamp).

HubSpot beacon: `AskPanel` uses `navigator.sendBeacon` to post unmatched questions to HubSpot's forms endpoint for adviser follow-up (URL configured inline in `AskPanel`; no user-provided keys).

---

## 6. Rebuild instructions (exact)

### 6.1 Local

```bash
cd frontend
yarn install --frozen-lockfile
yarn start           # dev server on http://localhost:3000
```

### 6.2 Production build (mirrors the CI workflow)

```bash
cd frontend
yarn install --frozen-lockfile
PUBLIC_URL=. CI=false yarn build
# SPA fallback for GitHub Pages deep links + refreshes:
cp build/index.html build/404.html
touch build/.nojekyll
```

Output lands in `frontend/build/`. Deploy that folder to any static host. `PUBLIC_URL=.` produces relative asset paths so the app runs from any sub-path (e.g. `getmycover.co.nz/tools/compare/`).

### 6.3 GitHub Pages via CI

`.github/workflows/build.yml` is the source of truth. On every push to `main`/`master`:

1. Checkout, install (yarn, frozen lockfile, node 20).
2. Build with `PUBLIC_URL=.`
3. Add `404.html` + `.nojekyll`.
4. Upload as Pages artifact, deploy via `actions/deploy-pages@v4`.

Enable Pages once in **Repo → Settings → Pages → Source = "GitHub Actions"**. The workflow does the rest.

The `frontend/build/` folder is also committed to the repo as a **manual fallback**. A maintainer can point any static host directly at `frontend/build/` without running CI.

---

## 7. Where common tasks live

| Task | File |
|---|---|
| Add a new insurer | `gmc_tool_data.json` (`insurers` + `data.{id}`) + drop `public/logos/{id}.png`. If they have a clean symbol, add a cropped `public/logos/marks/{id}.png` (128×128) and include the id in `InsurerMark.jsx → MARK_IDS`. |
| Add a new feature | `gmc_tool_data.json` (`features` + `data.*` entries) + add a lucide icon mapping in `FeatureIcon.jsx`. |
| Adjust brand colours | `frontend/src/index.css` (top of file, `--gmc-teal`, `--gmc-ink`, etc.) |
| Change spacing scale | Everything is on multiples of 4 px. Radii are three named tokens (`--gmc-r-ctl`, `--gmc-r-card`, `--gmc-r-chip`) in `index.css`. |
| Add an analytics event | `lib/analytics.js`, just call `pushEvent(name, payload)`. |

---

## 8. Gotchas learned in production

* **React StrictMode double-invokes effects in dev**. `MobileSheet` uses a 150 ms time guard to ignore the spurious `popstate` that the double-mount pattern produces. Do not remove.
* **`min-width` / `min-height` from `.gmc-tap` will win over an explicit `width`** if `.gmc-tap` is defined later in `index.css`. `.gmc-toggle` therefore uses `!important` on width/height to enforce the 38 × 22 spec.
* **iOS Safari auto-zooms on focus if input `font-size` < 16 px**. A global media rule in `index.css` forces 16 px on all inputs on `<768px`.
* **Sub-2 px borders snap to 1 px in Chromium**. The "Comparing" strip uses `inset box-shadow` to render a crisp 1.5 px stroke.
* **GitHub Pages returns 404 on client-side deep links**. The workflow copies `index.html` to `404.html` so refreshes still work.

---

## 9. What is intentionally *not* here

* No backend, no DB, no server-side rendering.
* No auth, no user accounts.
* No consent UI, the host site owns that.
* No `?ask=` prefill / no filter or ask-question state in `gmc_compare_context`, privacy restriction is deliberate.

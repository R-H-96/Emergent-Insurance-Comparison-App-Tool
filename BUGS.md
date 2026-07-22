# GMC Compare — Bug & Polish Tracker

How this works: anyone (Reuben or Claude) adds items; Claude fixes in code; Reuben pushes via GitHub Desktop; the GitHub Action rebuilds the Pages preview; both re-test; tick when verified on the live preview.
Status: [ ] open · [~] fixed in code, needs verify · [x] verified fixed

## Open — from Reuben's last desktop review (pre-Edit-3, re-verify against Edit-3 build first; some may already be fixed by the polish round)
- [ ] B1. Rail insurer popover: confirm 16px top gap + no text wrapping at common widths (was: touching top, words breaking)
- [ ] B2. Logos horizontally misaligned in picker cards (baseline drift) — verify InsurerLogo fix landed everywhere (main picker, popover, strip)
- [ ] B3. Filter toggle: confirm 38×22 brand toggle actually renders (was still oversized blob in v8) — verify visually, not via computed styles
- [ ] B4. Rail: clicking insurer icon/logo chip while popover open should close it (toggle) — verify; same for filter icon
- [ ] B5. "Comparing" strip: single mark + name (no wordmark duplication), CHANGE button inline after chips — verify
- [ ] B6. Compact ask bar restored above "The things people usually ask about" — verify present + engine works from it
- [ ] B7. Chat bubble bottom-right on desktop: verify it doesn't overlap the mobile bottom bar breakpoint or the rail at ~1200-1300px widths

## Open — mobile (from Reuben's phone pass; re-verify on real device against Edit-3)
- [ ] B8. Detail sheet: swipe-down dismiss, backdrop tap, browser-back close — verify all three on iOS Safari specifically
- [ ] B9. iOS input zoom: verify no zoom on ask inputs (16px font everywhere <768px)
- [ ] B10. Bottom bar hidden while sheets open; safe-area padding correct on notched phones

## Open — new/general
- [ ] B11. Embed test: ?embed=1 with --gmc-sticky-offset set — verify segmented control doesn't slide under a host navbar (test in a dummy page with fixed header before Webflow)
- [ ] B12. Marks: PL + UniMed circular initial-tiles look consistent next to SC/nib/AIA symbol crops (size, weight, centering)
- [ ] B13. Lighthouse pass on Pages build: a11y ≥95, note perf score baseline
- [ ] B14. Cross-browser sanity: Safari desktop + Firefox (framer-motion morph, popovers)

## Infra / integration (Claude)
- [~] I1. GitHub Actions workflow: fixed branch trigger (added Edit-3) + removed yarn.lock dependency (repo has no lockfile — npm install now). Needs: push + enable Pages + confirm green run
- [~] I2. Site-modal consent add-on written (gmc_consent_addon_FOOTER.html in website folder). Fetch-interceptor approach, existing form untouched. Needs: Reuben pastes into Webflow footer + adds tool_context + tool_context_note fields to HubSpot form + test.
- [ ] I3. HubSpot: add tool_context property/field to quote form (Reuben)
- [ ] I4. Formal code review of Edit-3 (Claude) — components, askEngine, notable.js, analytics
- [ ] I5. Decide Pages URL as interim preview vs keeping Emergent preview URL (Emergent preview may expire without credits — assume Pages is canonical)

## Done
- [x] D1. gmc_compare_context bridge: privacy-restricted write (product, insurers, timestamp only) — implemented + wired in ComparePage (verified in code 21 Jul)

## QA drive 21 Jul (Claude, desktop, Pages build)
- [x] B3 filter toggle to spec · B4 popover behaviour · B5 strip/CHANGE · B6 ask bar · density morph · modal bullets+glossary+source links · no h-scroll — ALL VERIFIED GOOD on desktop
- [x] NEW L1: all logos broken on Pages (absolute /logos/ paths vs sub-path hosting) — FIXED (PUBLIC_URL prefix), VERIFIED by Reuben 22 Jul (logos showing)
- [ ] Still to test: mobile pass (Reuben's phone), embed offset (B11), Lighthouse (B13), cross-browser (B14)

## Polish round 22 Jul (Claude, code — all need Reuben verify on Pages build)
- [~] P1. At-a-glance cards: added small round InsurerMark (size 18) next to each insurer name in the value tiles (AtAGlance.jsx). Verify logos show + align.
- [~] P2. At-a-glance value tiles now stack vertically on mobile, side-by-side on ≥640px (new `.gmc-glance-grid` in index.css, `--cols` var). Verify on phone.
- [~] P3. Mobile type bump: At-a-glance card heading 15→17px, definition 12→13.5px, tile value 13→14px (all mobile-only, desktop unchanged). Full-comparison mobile cards + 'Core limits' group headers also bumped. Verify readability.
- [~] P4. FIX mobile "Change" button was dead: InsurerStrip → onOpenPicker set `pickerOpen`, which only the desktop ControlDock listened to. MobileBottomBar's compare sheet is now controlled by that same state (ComparePage passes compareOpen/onCompareOpenChange). Verify Change opens the sheet on phone.
- [~] P5. FIX mobile sheet close-X hidden behind Safari chrome: MobileSheet maxHeight switched vh→dvh (dynamic viewport) + close button stops pointerdown so drag can't swallow the tap (MobileSheet.jsx). Verify X visible + tappable on iOS.
- [~] P6. FIX chat "Show me" left the ask sheet open: locateFeature now closes the ask panel (setAskOpen(false)) so the located row is visible (ComparePage.jsx). Verify on phone.
- [~] P7. FIX mobile detail card: top cut off on landing + scrolling up dismissed it. Root cause = whole sheet was draggable, so body swipes moved/closed the sheet. Now drag-to-dismiss only starts from the header/handle (useDragControls + dragListener=false); body scrolls freely (MobileSheet.jsx). Verify: open a card on phone, header visible on landing, can scroll full content, only a header pull-down closes it.
- Note: verified all changed files parse (Babel jsx); full CRA build not runnable in this env — CI Pages build is the real check.

## At-a-glance redesign 22 Jul (Claude, code — needs Reuben verify + adviser sign-off)
Replaces the old notable-card grid with a layered, differentiated surface: radar hero → care journey → differences reel. New files: data/glanceModel.js, components/InsurerRadar.jsx, CareJourney.jsx, DiffReel.jsx, TierBadge.jsx. AtAGlance.jsx recomposed.
- [~] R1. InsurerRadar — six-theme shape per selected insurer (2–3), derived from THEME_BANDS. Verify shapes render + labels don't clip on mobile.
- [~] R2. CareJourney — 5-stage strip, leader per stage from bands. Verify 5-col layout on narrow phones (may want 2-row wrap if too tight).
- [~] R3. DiffReel — reuses existing pair-aware notable engine (no new judgments); inline values + tap-through to detail. Verify tap opens the right feature.
- [~] R4. TierBadge — shared factual band pill (Standard/Higher/Highest).
- [ ] **R5. COMPLIANCE — THEME_BANDS in data/glanceModel.js are a first-pass editorial read of limit SIZE, drafted from the policy values. Must be reviewed + signed off (ideally by an adviser) before launch. They are labelled factual ("largest stated limit"), never "best". Adjusting a band updates radar + journey automatically.**
- [ ] R6. Copy check: radar/journey/diff disclaimers read as factual, not advice.

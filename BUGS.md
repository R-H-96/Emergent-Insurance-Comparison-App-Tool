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
- [ ] I2. Site-modal patch (host site, not this repo): read localStorage.gmc_compare_context, consent step ("share what you compared" — unticked by default, shows chips, optional free-text), append to HubSpot submit as tool_context. Claude writes against the Webflow footer embed
- [ ] I3. HubSpot: add tool_context property/field to quote form (Reuben)
- [ ] I4. Formal code review of Edit-3 (Claude) — components, askEngine, notable.js, analytics
- [ ] I5. Decide Pages URL as interim preview vs keeping Emergent preview URL (Emergent preview may expire without credits — assume Pages is canonical)

## Done
- [x] D1. gmc_compare_context bridge: privacy-restricted write (product, insurers, timestamp only) — implemented + wired in ComparePage (verified in code 21 Jul)

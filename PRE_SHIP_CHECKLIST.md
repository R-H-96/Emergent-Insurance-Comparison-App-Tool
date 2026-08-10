# Pre-ship checklist

Things that must be resolved before this tool is visible to the public. Ordered by how badly it goes if missed.

---

## 1. Turn off `ASSUME_VERIFIED` ⚠️

**File:** `frontend/src/lib/config.js`

Right now every value displays "Checked against the policy" and the trust line reads "Checked against policy documents". **None of that is true yet**. All 125 values in `gmc_tool_data.json` are still `"verified": "pending"`.

This is a display override so the tool demos cleanly. The data file was deliberately left truthful so there's nothing to undo.

To make the tool honest again, either set the env var:

```
REACT_APP_ASSUME_VERIFIED=false
```

or edit the constant in `config.js`.

**This is the single highest-risk item on the list.** Shipping with it on means publicly claiming every policy value has been checked against the insurer's own wording when none have. That's the exact thing the original launch rule prohibited: *nothing renders as Verified unless the source says YES.*

---

## 2. Complete the verification pass

**Tracker:** `GMC_Verification_Checklist.xlsx` (in the Get My Cover Website Project folder)

125 values across 5 policies and 25 features. The "Do these first" tab ranks them by leverage. The 9 notable features that drive the differences view and priority cards, then the values currently showing users "Not confirmed".

When a value is confirmed, set its `verified` field in `gmc_tool_data.json` to `"verified YYYY-MM-DD"`. Once all are done, delete the `ASSUME_VERIFIED` flag entirely.

---

## 3. Adviser sign-off on two editorial judgements

Neither of these is a fact-check, so neither is in the spreadsheet. Both put words on screen that a user could act on.

**`frontend/src/data/glanceModel.js`, `THEME_BANDS`**

The Standard / Higher / Highest bands behind the coverage radar, the care journey and the priority cards. An editorial read of how large each policy's stated limits are. The file carries its own note saying these need review before launch. Everything downstream is a pure function of these numbers.

**`frontend/src/lib/gaps.js`, cover-state groupings**

Which `signal` values count as "Not covered" versus "Only sometimes" versus "Not confirmed". Getting this wrong tells someone a policy excludes something it doesn't. The highest-consequence error the tool can make. The three-state split exists specifically so "we couldn't find it" is never rendered as "not covered"; keep that separation if the mapping is revised.

---

## 4. Content gaps

Two of the three items here have been closed since this list was written.

- **`why` now exists on all 25 features.** The 16 missing lines were drafted and applied. They are editorial copy, not extracted from any policy document, so they still want your read-through. See `GMC_Content_Draft_Review.md` in the project folder for the full list with the two I flagged as needing a second opinion: telehealth and premium structure.
- **Plain-English titles added for all 25 features.** Beginners see "Drugs the public system won't pay for"; readers who said they know the market see "Non-Pharmac medicines cap". Same editorial caveat applies.
- **Glossary grown from 15 to 27 terms.** Still only fires where a term is wrapped in `{braces}` in the data file, and terms inside the policy values themselves are deliberately unwrapped, since editing those for readability risks changing what a policy is recorded as saying. Worth doing as one pass during the verification work, when someone is reading those values anyway.
- **15 values are recorded as not found in the wording** (`not-stated`, `not-in-wording`, `none-identified`). These surface to users as "Not confirmed", which is deliberate and honest, but each needs either the real value or a confirmation that the policy genuinely is silent.

## 5. Wire the adviser CTA

Every CTA carries the `gmc-quote-trigger` class and no click handler, by design. The parent site's global modal binds to that class. Confirm that binding exists on the page where this is embedded, or the primary conversion path silently does nothing.

---

## 6. Legal and compliance

- Insurer logo usage. The trademark fair-use check flagged in the original UI/UX map.
- Confirm the standing disclaimer and the "not affiliated with any insurer" line appear on every rendered view, including the print output.
- Check that no ranking language has crept back in. The tool describes; it never recommends.

---

## 7. Before indexing

The original launch rule was that a comparison page shouldn't be indexed until its values are verified. Decide whether to launch behind `noindex` until item 2 is complete, or to launch only fully-verified sections.

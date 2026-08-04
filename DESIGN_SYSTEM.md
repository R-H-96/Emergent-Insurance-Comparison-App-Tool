# Design system

The rules this codebase follows. Read before adding or editing any component.

Written after an audit found seventeen font sizes, ten border radii, eleven shadows, three font weights doing two jobs, and one visual device carrying six unrelated meanings. All of that came from a single habit: inventing a value instead of picking one.

---

## The rule

**Never invent a value. Pick from the scale below, or add to it deliberately with a comment saying why.**

If the nearest step looks slightly wrong, the fix is almost never a new half-step. Either the wrong step was chosen, or the spacing and weight around it need work. `13.5px` is not a design decision. It is what happens when someone adds one to `12.5px`.

---

## Type

Seven steps. Each class carries its own mobile and desktop size, so responsive pairs are never hand-written per component. Defined in `index.css`.

| Class | Mobile | Desktop | Use for |
|---|---|---|---|
| `gmc-t-xs` | 12px | 11px | Captions, source lines, legal text |
| `gmc-t-sm` | 13px | 12px | Labels, metadata, feature definitions |
| `gmc-t-base` | 15px | 14px | Body copy, policy values |
| `gmc-t-md` | 16px | 15px | Emphasised body |
| `gmc-t-lg` | 18px | 17px | Card titles |
| `gmc-t-xl` | 22px | 20px | Panel headings |
| `gmc-t-2xl` | 28px | 26px | Page heading |

**Mobile gets the larger size.** Reading conditions on a phone are worse, not better. Do not write `text-[13px]` or `text-[14px] sm:text-[13px]`. Use the class.

## Weight

Two only.

- `gmc-w-strong` (600) for anything lifting off body copy
- `gmc-w-heavy` (800) for headings and names

A third weight between them stops weight signalling anything. Do not use `font-bold`, `font-semibold` or `font-extrabold` directly.

## Radius

Three tokens, from the brand kit.

- `var(--gmc-r-card)` 24px, top-level cards
- `var(--gmc-r-ctl)` 12px, everything inside a card, buttons, inputs, inner blocks
- `var(--gmc-r-chip)` full, pills and circular marks

No `8px`, `10px`, `14px`, `16px`, `rounded-lg`, `rounded-md`.

## Elevation

Three named shadows plus functional ones.

- `var(--gmc-shadow-card)` resting cards
- `var(--gmc-shadow-float)` sheets, popovers, modals
- `var(--gmc-shadow-sticky)` sticky bars separating from content scrolling beneath

Focus rings and inset borders are functional, not decorative, and stay inline.

## Colour

Teal is the brand and it does a lot of work already: active state, emphasis, links, verification, personalisation. **Before reaching for teal, check whether a neutral would do the job.** When one hue marks everything, it distinguishes nothing.

Insurer accents are for identification only. Never use an insurer's colour to mean anything other than "this is that insurer".

---

## One device, one meaning

This is the rule that matters most, and the one most easily broken.

A coloured left border previously marked insurer identity in five components and generic emphasis in three. Neither read as deliberate, because the same device meant two unrelated things.

Current assignments, do not overload them:

| Device | Means | Used in |
|---|---|---|
| Tinted identity band (`gmc-ident-band`) | This block belongs to this insurer | Detail modal blocks |
| Circular insurer mark | Which insurer | Everywhere identity is needed |
| 4px teal left border | Section header in the comparison table | Group header rows only |
| Tinted panel plus info icon | Explanatory aside | Why-this-matters callouts |
| Sparkle icon | These policies differ on this line | Notable marker only |

**If two things need distinguishing, use two devices. Never the same one twice.**

Also: do not signal the same thing three times. A card carrying an insurer's logo and its name in the insurer's colour does not also need a coloured bar.

---

## Structural rule

**Repeated styling belongs in a class. Inline styles are for genuinely dynamic values only**, such as an insurer's accent colour or a computed position.

Inline styling of sizes, radii, weights and shadows is what caused every problem above: with no shared vocabulary, each component invents its own numbers and drift cannot be audited.

---

## Auditing

These are countable. Run them before starting UI work and after any large change.

```bash
cd frontend/src

# Note the *.jsx globs: components/ui/ is vendored shadcn code and is
# deliberately excluded. Do not edit those files to satisfy these rules.

# distinct arbitrary font sizes. Should be 0.
grep -rhoE 'text-\[[0-9.]+px\]' components/*.jsx pages/*.jsx | sort -u

# arbitrary radii. Should be 0.
grep -rhoE 'rounded-\[[0-9]+px\]|rounded-(sm|md|lg|xl)\b' components/*.jsx pages/*.jsx | sort -u

# raw font weights. Should be 0.
grep -rhoE 'font-(light|normal|medium|semibold|bold|extrabold)' components/*.jsx pages/*.jsx | sort -u

# one device, many jobs. Every hit should be on the table above.
grep -rn 'borderLeft' components/*.jsx

# em dashes. Should be 0.
grep -rho "\u2014" components/*.jsx pages/*.jsx index.css | wc -l
```

More than seven type sizes, more than four radii, more than two weights, or one device appearing across unrelated components all mean the same thing: fix the system before adding features, because every new component multiplies the drift.

## Mobile

- Minimum tap target 44px (`.gmc-tap`)
- Hover has no touch equivalent. Anything explained on hover needs a tap path
- Popovers inside sheets need their stacking checked. A lower z-index renders them invisibly behind the sheet, which looks like a dead control
- Use `100dvh`, not `100vh`
- Respect `env(safe-area-inset-bottom)` for anything anchored to the bottom
- Respect `prefers-reduced-motion`

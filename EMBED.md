# Embedding the tool in Webflow

## Why not an iframe

The first attempt used an iframe. Three problems, all of them unfixable from inside one:

**Two scrollbars.** An iframe has a fixed height, so the tool scrolls inside its own box while the page scrolls around it.

**Modals cut in half.** A modal is `position: fixed`, which pins it to the *iframe's* viewport rather than the browser's. If the iframe is 1400px tall and only 800px of it is on screen, the modal centres itself in that 1400px and half of it sits where you cannot see it. Auto-resizing the iframe makes this worse, not better, because the taller the iframe the further off-screen the modal centres.

**The site navbar covers it.** An iframe is a single box in the parent page's stacking order. Nothing inside it can ever paint above something outside it, so the Webflow navbar sits over the tool no matter what z-index the tool uses.

Loading the tool onto the page directly solves all three, and it is also the only way the adviser CTA can work, since a parent page cannot see clicks inside an iframe.

---

## The snippet

Add a **Code Embed** element on the page where the tool should appear, and paste this:

```html
<div id="gmc-root"></div>
<script defer src="https://r-h-96.github.io/Emergent-Insurance-Comparison-App-Tool/static/js/gmc-tool.js"></script>
```

That is the whole thing, and it never needs changing. Pushing an update to the repo updates the live tool without touching Webflow.

**If you already pasted the older two-tag version, it still works.** The old stylesheet `<link>` now points at a file that no longer exists, which browsers ignore, and the script tag loads the current stylesheet itself. Delete the `<link>` line when convenient; nothing breaks either way.

### Why one tag instead of two

The URL in this snippet has to stay fixed, which argues for fixed filenames. Correct caching argues for the opposite: a content hash in the filename, so a changed file is a changed URL. GitHub Pages serves everything with `max-age=600` and that header cannot be configured, so with fixed filenames a visitor could hold a stale copy for ten minutes after every deploy, and could end up running last week's CSS against this week's JS.

The script above is a small generated loader. It keeps the fixed name, and names the current content-hashed pair, so the stylesheet and the bundle always arrive from the same build. It is rewritten on every deploy by `frontend/scripts/build-loader.js`, which runs automatically after `npm run build`.

The practical consequence: **a deploy is now live the moment the Action finishes.** No hard refresh, no waiting out a cache window, no "it looks broken but only on my machine".

**Set the sticky offset to your navbar height.** The tool has a sticky control bar. On the Webflow site it needs to start below your fixed navbar, otherwise it hides under it. Add this to the same embed, adjusting `80px` to your navbar's actual height:

```html
<style>
  #gmc-root { --gmc-sticky-offset: 80px; }
</style>
```

**Fonts.** The tool uses Plus Jakarta Sans. If your Webflow site does not already load it, add this to the page's head in Page Settings:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

---

## What was changed to make this safe

**Tailwind preflight is off.** Preflight is a global reset. Loaded onto the Webflow page it would have stripped margins, borders and font sizing from Webflow's own elements and wrecked the site around the tool. Everything preflight did is reproduced in `index.css`, scoped to `.gmc-app`, so the tool styles itself and cannot leak outward.

**The app mounts into `#gmc-root` when present**, falling back to `#root` for the standalone GitHub Pages build. Both get the `.gmc-app` class that carries the scoped reset.

**Build output is one JS file and one CSS file**, with no runtime chunk, so the loader only ever has two files to name. Both carry a content hash; only the loader has a fixed name.

**Overlay z-indexes were raised** from the 60 to 90 range up past 9900. Webflow navbars commonly sit around 1000, which was painting over the tool's sheets, dialogs and popovers.

---

## Test after publishing

1. The tool appears in the page with **one** scrollbar, not two
2. Opening a feature shows the whole modal, not a slice of it
3. The Webflow navbar sits **behind** any open modal or sheet, not over it
4. The sticky Yours / All differences / Everything bar stops below the navbar rather than under it
5. Webflow's own styling above and below the tool is unchanged
6. **The adviser CTA opens your quote modal.** This is the thing an iframe could never do. If it still does nothing, the global handler that binds to `.gmc-quote-trigger` is missing from the page
7. Check the same six on a phone

---

## Class names are a shared namespace

The Webflow site defines **71 classes of its own beginning `gmc-`**, including `gmc-card`, `gmc-nav`, `gmc-pill`, `gmc-cta`, `gmc-header` and `gmc-icon`. Because the tool loads onto the same page, any class name used by both is a collision, and whichever stylesheet comes later wins.

This is not theoretical. `gmc-card` was defined by the site with `padding: 32px`, which silently overrode the tool's card padding everywhere. The symptom looked like a spacing bug in the tool, and no amount of changing the tool's padding value would have fixed it.

Two names were renamed to get out of the way:

| Was | Now | Why |
|---|---|---|
| `gmc-card` | `gmc-surface` | Site defines it with its own padding and radius |
| `gmc-nav` | `gmc-topbar` | Site defines it as the fixed site header |

**Before adding any new class to the tool, check it against the site's stylesheet.** In the browser console on the live page:

```js
[...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
  .flatMap(r => [...(r.selectorText || '').matchAll(/\.(gmc-[a-z0-9_-]+)/g)].map(m => m[1]))
  .filter((v, i, a) => a.indexOf(v) === i).sort()
```

One class is shared on purpose and must not be renamed: **`gmc-quote-trigger`**, which is how the site's global quote modal binds to the tool's adviser CTAs.

---

## If Webflow styling still collides

The scoped reset stops the tool affecting the page. The reverse is also possible: a very broad Webflow selector such as `body *` or a global `a` rule can reach inside `#gmc-root`. If something looks wrong, inspect the element in the browser and look for a Webflow class winning the cascade. The fix is to make the Webflow rule more specific rather than fighting it from the tool.

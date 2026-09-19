/**
 * Rendered-page critique probe.
 *
 * design-guard.js reads SOURCE. It cannot see geometry, so it could never have
 * caught the bug that prompted this file: an SVG pill sized from a guess at how
 * wide the text would be, sitting 11px off centre on the rendered page while
 * the source looked entirely reasonable. A human spotted it in a screenshot.
 * That is the failure this closes.
 *
 * This is not run by `npm run build`. It is pasted into the browser console on
 * the real page, after a deploy, at a real width, because the whole point is to
 * measure what the browser actually drew rather than what the code intended.
 *
 *   1. open the page
 *   2. paste the contents of this file into the console
 *   3. read the table
 *
 * Every check below, like every check in design-guard, exists because the
 * mistake it catches actually shipped here.
 */
(function critique() {
  const app = document.querySelector(".gmc-app") || document.body;
  const out = { FAIL: [], WARN: [] };
  const fail = (m) => out.FAIL.push(m);
  const warn = (m) => out.WARN.push(m);
  const px = (n) => Math.round(n * 10) / 10;

  /* ── 1. SVG label pills: is the fill actually centred on its text? ────────
     The one that shipped. A <rect> behind a <text> whose padding differs left
     to right, or top to bottom, by more than a pixel. Measured from the real
     glyph box, which is the only number that matters and the only one the
     source does not know. */
  for (const g of app.querySelectorAll("svg g")) {
    const rect = g.querySelector("rect");
    const text = g.querySelector("text");
    if (!rect || !text) continue;
    const f = rect.getAttribute("fill");
    if (!f || f === "none" || f === "transparent") continue; // pill not showing
    const r = rect.getBBox();
    const t = text.getBBox();
    const L = t.x - r.x;
    const R = r.x + r.width - (t.x + t.width);
    const T = t.y - r.y;
    const B = r.y + r.height - (t.y + t.height);
    const name = text.textContent.trim();
    if (Math.abs(L - R) > 1) fail(`pill "${name}": ${px(L)}px left vs ${px(R)}px right, off by ${px(Math.abs(L - R))}`);
    if (Math.abs(T - B) > 1.5) fail(`pill "${name}": ${px(T)}px above vs ${px(B)}px below, off by ${px(Math.abs(T - B))}`);
    if (Math.min(L, R) < r.height / 2 - 1)
      warn(`pill "${name}": ${px(Math.min(L, R))}px side padding on a ${px(r.height)}px pill, so the glyphs sit inside the rounded cap`);
  }

  /* ── 2. Does any chart label collide with the plot, or with another label? */
  const labels = [...app.querySelectorAll("svg text")].filter((t) => t.textContent.trim());
  for (let i = 0; i < labels.length; i++) {
    const a = labels[i].getBoundingClientRect();
    for (let j = i + 1; j < labels.length; j++) {
      const b = labels[j].getBoundingClientRect();
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom)
        fail(`labels overlap: "${labels[i].textContent.trim()}" and "${labels[j].textContent.trim()}"`);
    }
  }
  for (const poly of app.querySelectorAll("svg polygon")) {
    const p = poly.getBoundingClientRect();
    for (const t of labels) {
      const b = t.getBoundingClientRect();
      if (p.left < b.right && b.left < p.right && p.top < b.bottom && b.top < p.bottom)
        warn(`"${t.textContent.trim()}" overlaps a plotted shape`);
    }
  }

  /* ── 3. Tap targets. 54 of these were below 44px before anyone counted. ─── */
  const small = [];
  for (const el of app.querySelectorAll("button,[role=button],a,input,select")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const after = getComputedStyle(el, "::after");
    if (after && after.content !== "none" && parseFloat(after.height) >= 44) continue; // .gmc-tap-area
    if (r.height < 44 || r.width < 44)
      small.push(`${el.tagName.toLowerCase()}.${(el.className.baseVal || el.className || "").toString().split(" ")[0]} ${px(r.width)}x${px(r.height)} "${(el.textContent || "").trim().slice(0, 24)}"`);
  }
  if (small.length) warn(`${small.length} tap target(s) under 44px:\n    ` + small.slice(0, 12).join("\n    "));

  /* ── 4. Contrast, computed on what the browser actually painted. ──────────
     Not on token pairs I assumed were used together, which is what the source
     check can do. This walks up for the real effective background. */
  const lum = (rgb) => {
    const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const bgOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && !/rgba?\([^)]*,\s*0\)/.test(bg) && bg !== "transparent") return bg;
    }
    return "rgb(255,255,255)";
  };
  const seen = new Set();
  for (const el of app.querySelectorAll("*")) {
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
    if (!txt) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.3) continue;
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    const need = large ? 3 : 4.5;
    const a = lum(cs.color);
    const b = lum(bgOf(el));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const key = cs.color + bgOf(el) + size;
    if (ratio < need && !seen.has(key)) {
      seen.add(key);
      fail(`contrast ${ratio.toFixed(2)} (needs ${need}) at ${px(size)}px: "${txt.slice(0, 40)}"`);
    }
  }

  /* ── 5. Horizontal overflow. The mobile ladder did this. ─────────────────── */
  const vw = document.documentElement.clientWidth;
  for (const el of app.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const cs = getComputedStyle(el.parentElement || el);
      if (cs.overflowX === "auto" || cs.overflowX === "scroll") continue; // deliberate strip
      warn(`overflows the viewport: <${el.tagName.toLowerCase()}> right edge at ${px(r.right)} of ${vw}`);
      break;
    }
  }

  /* ── 6. Grey. Standing instruction: containers are white with a hairline. ─ */
  const greys = new Map();
  for (const el of app.querySelectorAll("div,section,button,li")) {
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b] = m.map(Number);
    if (m[3] !== undefined && +m[3] === 0) continue;
    const isGrey = Math.max(r, g, b) - Math.min(r, g, b) < 14 && r < 252 && r > 200;
    if (!isGrey) continue;
    const interactive = el.tagName === "BUTTON" || el.getAttribute("role") === "button" || el.closest("button");
    if (interactive) continue; // controls and disabled states keep their fill
    greys.set(bg, (greys.get(bg) || 0) + 1);
  }
  for (const [bg, n] of greys) warn(`grey container fill ${bg} on ${n} non-interactive element(s)`);

  const report = [];
  for (const k of ["FAIL", "WARN"]) if (out[k].length) report.push(`\n${k} (${out[k].length})\n  ` + out[k].join("\n  "));
  console.log(report.length ? report.join("\n") : "\ncritique: clean at " + vw + "px\n");
  return { width: vw, fail: out.FAIL.length, warn: out.WARN.length, detail: out };
})();

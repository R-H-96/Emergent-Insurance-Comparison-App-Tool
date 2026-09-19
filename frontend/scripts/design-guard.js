#!/usr/bin/env node
/**
 * Design guard.
 *
 * Every check below exists because the mistake it catches actually shipped in
 * this project. This is deliberately NOT a general linter: it does not care
 * about code style, it cares about the specific ways UI work here has gone
 * wrong and been caught by a human looking at a screenshot instead of by a
 * script.
 *
 *   node scripts/design-guard.js
 *
 * Exits non-zero if any ERROR fires. WARN is advisory.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "src");
const errors = [];
const warns = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warns.push(`${file}: ${msg}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules") walk(f, out); }
    else out.push(f);
  }
  return out;
}
const files = walk(SRC);
const jsx = files.filter((f) => /\.jsx$/.test(f) && !f.includes(`${path.sep}ui${path.sep}`));
const rel = (f) => path.relative(SRC, f);
const css = fs.readFileSync(path.join(SRC, "index.css"), "utf8");

/* ── 1. Duplicate props on one JSX element ─────────────────────────────────
   Shipped once. Two style props on a div: the second silently overwrites the
   first, so a border that was written never rendered. Valid syntax, so a
   parser will never flag it. */
for (const f of jsx) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/<[A-Za-z][\s\S]{0,1200}?>/g)) {
    const tag = m.group ? m.group(0) : m[0];
    for (const prop of ["style", "className"]) {
      const hits = (tag.match(new RegExp(`(?<![\\w-])${prop}=`, "g")) || []).length;
      if (hits > 1) {
        const line = src.slice(0, m.index).split("\n").length;
        err(rel(f), `line ${line}: two \`${prop}\` props on one element. The second overwrites the first.`);
      }
    }
  }
}

/* ── 2. Colour contrast on the token pairs actually used together ─────────
   "More contrast" was requested three times because nobody was computing it. */
const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const token = (name) => (css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];

const TEXT_ON = [
  ["gmc-body", "gmc-card", 4.5], ["gmc-body", "gmc-bg", 4.5],
  ["gmc-body", "gmc-bg-alt", 4.5], ["gmc-body", "gmc-inset-bg", 4.5],
  ["gmc-muted", "gmc-card", 4.5], ["gmc-muted", "gmc-bg", 4.5],
  ["gmc-muted", "gmc-bg-alt", 4.5], ["gmc-muted", "gmc-inset-bg", 4.5],
  ["gmc-ink", "gmc-card", 4.5], ["gmc-teal-deep", "gmc-card", 4.5],
];
for (const [fg, bg, need] of TEXT_ON) {
  const a = token(fg), b = token(bg);
  if (!a || !b) continue;
  const r = ratio(a, b);
  if (r < need) err("index.css", `--${fg} on --${bg} is ${r.toFixed(2)}, needs ${need}`);
}

/* Surface separation. Below ~1.06 two surfaces have no visible boundary, so a
   card sitting on a page that close needs a border to exist at all. */
const SURFACES = [["gmc-card", "gmc-bg"], ["gmc-card", "gmc-inset-bg"], ["gmc-bg", "gmc-bg-alt"]];
for (const [a, b] of SURFACES) {
  const x = token(a), y = token(b);
  if (!x || !y) continue;
  const r = ratio(x, y);
  if (r < 1.06) warn("index.css", `--${a} vs --${b} is ${r.toFixed(3)}: no visible edge without a border`);
}

/* ── 3. Type scale sprawl ─────────────────────────────────────────────────── */
const steps = (css.match(/^\.gmc-t-[a-z0-9]+\s*\{/gm) || []).length;
if (steps > 7) warn("index.css", `${steps} type steps. More than seven means there is no scale.`);

for (const f of jsx) {
  const src = fs.readFileSync(f, "utf8");
  const arb = src.match(/text-\[[0-9.]+px\]/g);
  if (arb) err(rel(f), `arbitrary font size(s): ${[...new Set(arb)].join(", ")}`);
  const wt = src.match(/font-(light|normal|medium|semibold|bold|extrabold)\b/g);
  if (wt) err(rel(f), `raw font weight(s): ${[...new Set(wt)].join(", ")}. Use gmc-w-strong or gmc-w-heavy.`);
  const rad = src.match(/rounded-(sm|md|lg|xl)\b|rounded-\[[0-9]+px\]/g);
  if (rad) err(rel(f), `arbitrary radius: ${[...new Set(rad)].join(", ")}. Use the three tokens.`);
}

/* ── 4. Content longer than its type size can hold ────────────────────────
   A display step was added, sized against a nine-character value, when the
   median real value is 31 characters. Caught by a human, not by anything. */
const DATA = path.join(SRC, "data", "gmc_tool_data.json");
if (fs.existsSync(DATA)) {
  const d = JSON.parse(fs.readFileSync(DATA, "utf8"));
  const vals = Object.values(d.data || {}).flat().map((r) => (r && r.short) || "").filter(Boolean);
  if (vals.length) {
    const longest = vals.reduce((a, b) => (b.length > a.length ? b : a));
    const sorted = vals.map((v) => v.length).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    // Rough: at ~0.55em per character, how wide is the longest value?
    const CHECK = [["gmc-t-lg", 18], ["gmc-t-xl", 22], ["gmc-t-2xl", 28]];
    for (const [cls, px] of CHECK) {
      // The class must sit on the same element that renders a policy value,
      // not merely appear somewhere in a file that also mentions one.
      const used = jsx.some((f) => {
        const src = fs.readFileSync(f, "utf8");
        const re = new RegExp(`className="[^"]*\\b${cls}\\b[^"]*"[\\s\\S]{0,400}?entry\\?\\.short`);
        return re.test(src);
      });
      if (!used) continue;
      const w = longest.length * px * 0.55;
      if (w > 360) {
        warn("data", `${cls} (${px}px) renders the longest value (${longest.length} chars) at ~${Math.round(w)}px wide, which wraps on a 390px screen. Median value is ${median} chars.`);
      }
    }
  }
}

/* ── 5. Emphasis device count per component ───────────────────────────────
   Twelve devices fired on one comparison row before anyone counted them. */
const DEVICES = [
  [/background:\s*["'`]?var\(--gmc-teal-tint/g, "teal tint fill"],
  [/borderLeft:/g, "coloured left rule"],
  [/rounded-full/g, "pill"],
  [/gmc-w-heavy/g, "heavy weight"],
  [/boxShadow:\s*[`"']inset/g, "inset ring"],
  [/<Sparkles/g, "sparkle"],
  [/color:\s*ins\.accent|color:\s*insurer\.accent/g, "accent as text colour"],
];
for (const f of jsx) {
  const src = fs.readFileSync(f, "utf8");
  const hits = DEVICES.filter(([re]) => (src.match(re) || []).length > 0).map(([, n]) => n);
  if (hits.length > 4) warn(rel(f), `${hits.length} emphasis devices: ${hits.join(", ")}. Above four, subtract rather than add.`);
}

/* ── 6. Em dashes. Standing rule. ─────────────────────────────────────────── */
for (const f of files.filter((f) => /\.(jsx?|css|json|md)$/.test(f))) {
  const src = fs.readFileSync(f, "utf8");
  const n = (src.match(/\u2014/g) || []).length;
  if (n) err(rel(f), `${n} em dash(es)`);
}

/* ── report ──────────────────────────────────────────────────────────────── */
const pad = (s) => `  ${s}`;
if (warns.length) {
  console.log(`\nWARN (${warns.length})`);
  warns.forEach((w) => console.log(pad(w)));
}
if (errors.length) {
  console.log(`\nERROR (${errors.length})`);
  errors.forEach((e) => console.log(pad(e)));
  console.log(`\ndesign-guard: ${errors.length} error(s), ${warns.length} warning(s)\n`);
  process.exit(1);
}
console.log(`\ndesign-guard: clean. ${warns.length} warning(s).\n`);

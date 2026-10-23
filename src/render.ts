import type { DailyResult } from "./store.ts";
import { cellName } from "./solver.ts";

const SITE_TITLE = process.env.SITE_TITLE || "Daily Sudoku Results";

export const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const RESULT_PREFIX = "/sudoku-daily-result";
export const resultPath = (date: string) => `${RESULT_PREFIX}/${date}`;

export const prettyDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

const STYLES = /* css */ `
:root{
  --bg:#f6f5f1;--surface:#fff;--ink:#1d1d1b;--muted:#6b6a65;--line:#d9d6cc;--line-strong:#1d1d1b;
  --accent:#2f5bd3;--accent-soft:#e6ecfb;--hl:#fff1b8;--elim:#fde2e0;--good:#1f7a4d;
  --radius:14px;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
}
@media (prefers-color-scheme:dark){:root{
  --bg:#141413;--surface:#1e1e1c;--ink:#ecebe6;--muted:#a09f99;--line:#3a3935;--line-strong:#d8d6cf;
  --accent:#86a5ff;--accent-soft:#25304d;--hl:#4a4220;--elim:#4a2523;--good:#5cc28f;
}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);line-height:1.5}
a{color:var(--accent)}
.wrap{max-width:1040px;margin:0 auto;padding:24px 16px 64px}
header.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:24px}
header.top .brand{font-weight:700;text-decoration:none;color:var(--ink);font-size:18px}
header.top nav a{margin-left:16px;text-decoration:none;color:var(--muted)}
h1{font-size:clamp(24px,4vw,34px);margin:0 0 4px;letter-spacing:-.01em}
.sub{color:var(--muted);margin:0 0 24px}
.layout{display:grid;grid-template-columns:minmax(0,460px) minmax(0,1fr);gap:28px;align-items:start}
@media (max-width:820px){.layout{grid-template-columns:1fr}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:18px}
.board{display:grid;grid-template-columns:repeat(9,1fr);aspect-ratio:1;border:2px solid var(--line-strong);border-radius:6px;overflow:hidden;background:var(--surface);user-select:none}
.cell{display:flex;align-items:center;justify-content:center;font-size:clamp(16px,4.6vw,26px);border-right:1px solid var(--line);border-bottom:1px solid var(--line);transition:background .15s}
.cell:nth-child(9n){border-right:0}
.cell:nth-child(9n+3),.cell:nth-child(9n+6){border-right:2px solid var(--line-strong)}
.cell:nth-child(n+19):nth-child(-n+27),.cell:nth-child(n+46):nth-child(-n+54){border-bottom:2px solid var(--line-strong)}
.cell:nth-child(n+73){border-bottom:0}
.cell.given{font-weight:700}
.cell.solved{color:var(--accent);font-weight:500}
.cell.current{background:var(--hl)}
.cell.elim{background:var(--elim)}
.controls{display:flex;gap:8px;align-items:center;margin-top:14px}
.controls input[type=range]{flex:1;accent-color:var(--accent)}
button{font:inherit;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:8px;padding:6px 12px;cursor:pointer}
button:hover{border-color:var(--accent)}
button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
.caption{min-height:48px;margin-top:12px;font-size:14px;color:var(--muted)}
.caption b{color:var(--ink)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:18px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.stat .k{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.stat .v{font-size:22px;font-weight:700;margin-top:2px}
.badge{display:inline-block;padding:2px 10px;border-radius:999px;background:var(--accent-soft);color:var(--accent);font-size:13px;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:14px;background:var(--surface)}
.chip b{color:var(--accent)}
h2{font-size:18px;margin:22px 0 10px}
ol.steps{list-style:none;margin:0;padding:0;max-height:440px;overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
ol.steps li{display:grid;grid-template-columns:44px 1fr;gap:8px;padding:8px 12px;border-bottom:1px solid var(--line);font-size:14px;cursor:pointer}
ol.steps li:last-child{border-bottom:0}
ol.steps li:hover{background:var(--accent-soft)}
ol.steps li.active{background:var(--hl)}
ol.steps .n{color:var(--muted);font-variant-numeric:tabular-nums}
ol.steps .t{font-weight:600}
.datenav{display:flex;justify-content:space-between;margin-top:28px}
.ok{color:var(--good);font-weight:600}
.archive{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;padding:0;list-style:none}
.archive a{display:block;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--surface);text-decoration:none;color:var(--ink)}
.archive a:hover{border-color:var(--accent)}
footer{margin-top:48px;color:var(--muted);font-size:13px}
`;

// Per-game page chrome: brand, nav links, footer and any extra CSS
export interface Chrome {
  brand: string;
  brandHref: string;
  nav: [href: string, label: string][];
  footer: string;
  css?: string;
}

const SUDOKU_CHROME: Chrome = {
  brand: SITE_TITLE,
  brandHref: "/",
  nav: [
    ["/", "Today"],
    ["/archive", "Archive"],
    ["/wordle", "Wordle"],
    ["/connections", "Connections"],
  ],
  footer: "Puzzles from the sudoku.com Daily Challenge. Solutions computed independently by our logic solver.",
};

export function layout(title: string, description: string, body: string, canonicalPath: string, noindex = false, chrome = SUDOKU_CHROME) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">${noindex ? '\n<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${esc((process.env.URL ?? "") + canonicalPath)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<style>${STYLES}${chrome.css ?? ""}</style>
</head><body><div class="wrap">
<header class="top"><a class="brand" href="${chrome.brandHref}">${esc(chrome.brand)}</a><nav>${chrome.nav.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join("")}</nav></header>
${body}
<footer>${esc(chrome.footer)}</footer>
</div></body></html>`;
}

function boardCells(puzzle: string, solution: string) {
  return [...solution]
    .map((d, i) => {
      const given = puzzle[i] !== "0";
      return `<div class="cell ${given ? "given" : "solved"}" data-i="${i}">${d}</div>`;
    })
    .join("");
}

export function renderResult(r: DailyResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const { result: res } = r;
  const placements = res.steps.filter((s) => s.type === "place").length;
  const title = `Sudoku Daily Challenge ${prettyDate(r.date)} – Answer & Solution`;
  const description = `Solution for the sudoku.com Daily Challenge on ${prettyDate(r.date)} (${r.source.difficulty}). Step-by-step logical solve with ${placements} moves.`;

  const techChips = Object.entries(res.techniques)
    .sort((a, b) => b[1]! - a[1]!)
    .map(([t, n]) => `<span class="chip">${esc(t)} <b>×${n}</b></span>`)
    .join("");

  const steps = res.steps
    .map((s, idx) => {
      const what = s.type === "place" ? `${cellName(s.cell)} = ${s.digit}` : `Remove ${s.removed.length} candidate${s.removed.length > 1 ? "s" : ""}`;
      return `<li data-k="${idx + 1}"><span class="n">${idx + 1}</span><span><span class="t">${esc(s.tech)}</span> · ${esc(what)}<br><span style="color:var(--muted)">${esc(s.why)}</span></span></li>`;
    })
    .join("");

  // Embedded for the replay player; "<" escaped so the JSON can't close the script tag
  const data = JSON.stringify({ puzzle: r.puzzle, steps: res.steps }).replace(/</g, "\\u003c");

  const body = `
<h1>${isHome ? "Today's " : ""}Sudoku Daily Challenge</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">${esc(r.source.difficulty)}</span></p>

<div class="layout">
  <section class="card">
    <div class="board" id="board">${boardCells(r.puzzle, res.solution)}</div>
    <div class="controls">
      <button id="first" title="Show puzzle">⏮</button>
      <button id="prev" title="Previous step">◀</button>
      <button id="play" class="primary">Play</button>
      <button id="next" title="Next step">▶</button>
      <button id="last" title="Show solution">⏭</button>
    </div>
    <div class="controls"><input id="slider" type="range" min="0" max="${res.steps.length}" value="${res.steps.length}" aria-label="Solve step"></div>
    <div class="caption" id="caption"><b>Final solution.</b> Press ⏮ to see the original puzzle, or Play to watch it get solved.</div>
  </section>

  <section>
    <div class="stats">
      <div class="stat"><div class="k">sudoku.com level</div><div class="v" style="text-transform:capitalize">${esc(r.source.difficulty)}</div></div>
      <div class="stat"><div class="k">Logic rating</div><div class="v">${esc(res.rating)}</div></div>
      <div class="stat"><div class="k">Given clues</div><div class="v">${res.givens}</div></div>
      <div class="stat"><div class="k">Moves</div><div class="v">${placements}</div></div>
      <div class="stat"><div class="k">Win rate</div><div class="v">${r.source.winRate}%</div></div>
      <div class="stat"><div class="k">Solved in</div><div class="v">${res.timeMs} ms</div></div>
    </div>
    <p>${res.uniqueSolution ? '<span class="ok">✓ Unique solution</span>' : "⚠ Multiple solutions exist"}
      ${r.matchesSource ? ' · <span class="ok">✓ Verified</span>' : ""}</p>

    <h2>Techniques used</h2>
    <div class="chips">${techChips}</div>

    <h2>Step-by-step solution</h2>
    <ol class="steps" id="steps">${steps}</ol>
  </section>
</div>

<div class="datenav">
  <span>${nav.older ? `<a href="${resultPath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${resultPath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>

<script type="application/json" id="data">${data}</script>
<script>
(() => {
  const { puzzle, steps } = JSON.parse(document.getElementById("data").textContent);
  const cells = [...document.querySelectorAll("#board .cell")];
  const slider = document.getElementById("slider");
  const caption = document.getElementById("caption");
  const items = [...document.querySelectorAll("#steps li")];
  const playBtn = document.getElementById("play");
  const cn = (i) => "R" + (Math.floor(i / 9) + 1) + "C" + (i % 9 + 1);
  let k = steps.length, timer = null;

  function render() {
    const v = [...puzzle].map(Number);
    for (let j = 0; j < k; j++) if (steps[j].type === "place") v[steps[j].cell] = steps[j].digit;
    cells.forEach((c, i) => { c.textContent = v[i] || ""; c.classList.remove("current", "elim"); });
    items.forEach((li) => li.classList.toggle("active", +li.dataset.k === k));
    slider.value = k;
    const s = steps[k - 1];
    if (!s) { caption.innerHTML = "<b>Original puzzle.</b> " + puzzle.replace(/0/g, "").length + " clues given."; return; }
    if (s.type === "place") cells[s.cell].classList.add("current");
    else s.removed.forEach(([c]) => cells[c].classList.add("elim"));
    const extra = s.type === "elim" ? " Removed: " + s.removed.map(([c, d]) => d + " from " + cn(c)).join(", ") + "." : "";
    caption.innerHTML = "<b>Step " + k + " of " + steps.length + " · " + s.tech + ".</b> " + s.why.replace(/</g, "&lt;") + "." + extra;
    const active = items[k - 1];
    if (active && timer) active.scrollIntoView({ block: "nearest" });
  }
  const go = (n) => { k = Math.max(0, Math.min(steps.length, n)); render(); };
  const stop = () => { clearInterval(timer); timer = null; playBtn.textContent = "Play"; };

  document.getElementById("first").onclick = () => { stop(); go(0); };
  document.getElementById("last").onclick = () => { stop(); go(steps.length); };
  document.getElementById("prev").onclick = () => { stop(); go(k - 1); };
  document.getElementById("next").onclick = () => { stop(); go(k + 1); };
  slider.oninput = () => { stop(); go(+slider.value); };
  items.forEach((li) => li.onclick = () => { stop(); go(+li.dataset.k); });
  playBtn.onclick = () => {
    if (timer) return stop();
    if (k >= steps.length) go(0);
    playBtn.textContent = "Pause";
    timer = setInterval(() => (k >= steps.length ? stop() : go(k + 1)), 350);
  };
})();
</script>`;

  return layout(title, description, body, resultPath(r.date));
}

export function renderArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${resultPath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    `Sudoku Daily Challenge Archive – All Solutions`,
    `Every sudoku.com Daily Challenge solution, solved step by step.`,
    `<h1>Archive</h1><p class="sub">${dates.length} daily puzzles solved</p>${list}`,
    "/archive",
  );
}

export function renderNotFound(date?: string) {
  return layout(
    "Result not found",
    "This Sudoku result is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No result for ${esc(date)} yet.` : "No results have been crawled yet."} <a href="/archive">Browse the archive</a>.</p>`,
    "/",
    true,
  );
}

export function renderSitemap(dates: string[], extraPaths: string[] = []) {
  const base = process.env.URL ?? "";
  const urls = ["/", "/archive", ...dates.map(resultPath), ...extraPaths];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(base + u)}</loc></url>`).join("\n")}
</urlset>`;
}

import { esc, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { DIFFICULTIES, type Cell, type PipsDifficulty, type PipsPuzzle } from "./nyt.ts";
import type { PipsResult } from "./store.ts";

export const PIPS_HOME = "/pips";
export const pipsPath = (date: string) => `${PIPS_HOME}/${date}`;
export const pipsSitemapPaths = (dates: string[]) => [PIPS_HOME, `${PIPS_HOME}/archive`, ...dates.map(pipsPath)];

const CHROME: Chrome = {
  brand: "Pips Answers",
  brandHref: PIPS_HOME,
  gameIcon: "🎲",
  nav: [
    [PIPS_HOME, "Today"],
    [`${PIPS_HOME}/archive`, "Archive"],
  ],
  footer: "Daily hints and answers for the New York Times Pips. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.pips-app [hidden] { display: none !important; }
.pips-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
.pips-tabs { display: inline-flex; background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 4px; gap: 2px; }
.pips-tabs button { font: inherit; font-weight: 700; font-size: 15px; color: var(--ink-2); background: none; border: 0; border-radius: var(--radius-pill); padding: 9px 20px; cursor: pointer; transition: background .15s, color .15s; }
.pips-tabs button[aria-selected="true"] { background: var(--ink); color: var(--surface); }
.pips-date { display: inline-flex; align-items: center; gap: 10px; background: var(--ink); color: var(--surface); border-radius: var(--radius-pill); padding: 11px 22px; font-weight: 700; font-size: 15px; }
.pips-date:hover { color: var(--surface); filter: brightness(1.15); }
.pips-step { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); color: var(--ink-2); font-weight: 800; }
.pips-step:hover { border-color: var(--accent); color: var(--accent); }
.pips-step[aria-disabled="true"] { opacity: .35; pointer-events: none; }
.pips-stage { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 32px; align-items: start; }
.pips-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); }
.pips-meta { color: var(--muted); font-size: 14px; font-weight: 600; margin: 0 0 12px; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
#pipsSvg { display: block; width: 100%; height: auto; margin: 0 auto; cursor: pointer; }
.pp-edges line { stroke-width: 2.6; stroke-dasharray: 6 4; stroke-linecap: round; fill: none; }
.pp-mark rect { stroke: var(--surface); stroke-width: 2; }
.pp-mark text { font: 800 13px var(--font-sans); fill: #fff; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
.pp-tile { fill: none; stroke: var(--ink); stroke-width: 3; }
.pp-split { stroke: var(--ink); stroke-width: 1.5; opacity: .55; stroke-linecap: round; }
.pp-dot { fill: var(--ink); }
.pp-placed { animation: pp-pop .22s ease-out; transform-box: fill-box; transform-origin: center; }
@keyframes pp-pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }
.pips-dominoes { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 12px; }
.pp-dom { font: inherit; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 10px; transition: transform .12s; }
.pp-dom:hover { transform: translateY(-2px); }
.pp-dom svg { display: block; width: 100%; height: auto; }
.pp-dtile { fill: var(--surface); stroke: var(--line); stroke-width: 2; }
.pp-dsplit { stroke: var(--line); stroke-width: 2; stroke-linecap: round; }
.pp-ddot { fill: var(--ink-2); }
.pp-dom.used { opacity: .4; }
.pips-help { font-style: italic; color: var(--ink-2); font-size: 14px; margin: 16px 0 14px; }
.pips-help b { font-weight: 800; }
.pips-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.pips-btn { font: inherit; font-weight: 700; font-size: 14px; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 9px 16px; cursor: pointer; }
.pips-btn:hover { border-color: var(--accent); color: var(--accent); }
.pips-btn.primary { background: var(--accent-gradient); border-color: transparent; color: #fff; }
.pips-btn.primary:hover { color: #fff; filter: brightness(1.06); }
.pips-done { margin: 14px 0 0; padding: 10px 14px; border-radius: var(--radius); background: var(--good-soft); color: var(--good); font-weight: 700; font-size: 14px; }
@media (max-width: 860px) { .pips-stage { grid-template-columns: 1fr; gap: 20px; } .pips-card { padding: 16px; } }
`,
};

// JSON for the inline <script>: "<" is escaped so the data can never close the tag
const jsonForScript = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

export function renderPipsResult(r: PipsResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const data = Object.fromEntries(DIFFICULTIES.map((d) => [d, { ...r.puzzles[d] }]));
  const step = (href: string | null, arrow: string, title: string) =>
    href ? `<a class="pips-step" href="${href}" title="${title}">${arrow}</a>` : `<span class="pips-step" aria-disabled="true">${arrow}</span>`;

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Pips Solver – Hints &amp; Answers</h1>
  <div class="sub">
    <span class="badge">NYT Pips</span>
    <span class="badge good">Easy · Medium · Hard</span>
  </div>
</div>

<div class="pips-app">
  <div class="pips-bar">
    <div class="pips-tabs" id="pipsTabs" role="tablist" aria-label="Difficulty">
      <button type="button" role="tab" data-level="hard" aria-selected="false">Hard</button>
      <button type="button" role="tab" data-level="medium" aria-selected="false">Medium</button>
      <button type="button" role="tab" data-level="easy" aria-selected="true">Easy</button>
    </div>
    ${step(nav.older ? pipsPath(nav.older) : null, "‹", "Previous day")}
    <a class="pips-date" href="${PIPS_HOME}/archive" title="Browse the archive">📅 ${esc(shortDate(r.date))}, ${r.date.slice(0, 4)}</a>
    ${step(nav.newer ? pipsPath(nav.newer) : null, "›", "Next day")}
  </div>

  <div class="pips-stage">
    <div class="pips-card">
      <p class="pips-meta"><span id="pipsMeta"></span><span id="pipsCount"></span></p>
      <svg id="pipsSvg" role="img" aria-label="Pips board. Click a cell to place its domino."></svg>
      <p class="pips-done" id="pipsDone" hidden>✅ Solved – every domino is in place.</p>
    </div>
    <div>
      <div class="pips-dominoes" id="pipsDominoes" aria-label="Dominoes"></div>
      <p class="pips-help"><b>Click a domino</b> to place it on the board OR <b>click a cell on the board</b> to place the correct domino. Click again to take it back.</p>
      <div class="pips-actions">
        <button class="pips-btn" id="pipsHint" type="button">💡 Place one</button>
        <button class="pips-btn primary" id="pipsSolve" type="button">Show full solution</button>
        <button class="pips-btn" id="pipsReset" type="button">↺ Reset</button>
      </div>
    </div>
  </div>
</div>
<script type="application/json" id="pipsData">${jsonForScript(data)}</script>

<div class="datenav">
  <span>${nav.older ? `<a href="${pipsPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${pipsPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>` : ""}</span>
</div>
<script src="/assets/pips.js" defer></script>`;

  return layout(
    `Pips Hints & Answers Today (${prettyDate(r.date)}) – NYT Daily Puzzle`,
    `Interactive solver, hints and complete solutions for the easy, medium and hard NYT Pips puzzles on ${prettyDate(r.date)}. Click a domino or a cell to place the correct piece.`,
    body,
    pipsPath(r.date),
    false,
    CHROME
  );
}

export function renderPipsArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map((d) => `<li data-date="${d}"><a href="${pipsPath(d)}"><b>${esc(prettyDate(d))}</b><span class="date-tag">📅 ${d}</span></a></li>`)
        .join("")}</ul>`
    : `<p class="sub">No Pips puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Pips Answers Archive</h1>
  <p class="sub">${dates.length} past NYT Pips puzzles and hints</p>
</div>

<div class="archive-controls">
  <input type="search" id="archiveSearch" class="search-input" placeholder="Search date (e.g. 2026-10 or Oct)..." aria-label="Search archive">
</div>

${list}

<script>
(() => {
  const search = document.getElementById("archiveSearch");
  const items = [...document.querySelectorAll("#archiveGrid li")];
  if (search && items.length) {
    search.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      items.forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  }
})();
</script>`;

  return layout("Pips Answers Archive – Past Hints & Solutions", "Hints and solutions for every past NYT Pips puzzle.", body, `${PIPS_HOME}/archive`, false, CHROME);
}

export function renderPipsNotFound(date?: string) {
  return layout(
    "Pips Puzzle Not Found",
    "This Pips puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🎲</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Pips puzzles are available."}</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${PIPS_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="${PIPS_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    PIPS_HOME,
    true,
    CHROME
  );
}

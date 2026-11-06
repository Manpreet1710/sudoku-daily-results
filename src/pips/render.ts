import { esc, dateNav, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { historyBoard, historyBoards, historyDate, renderHistory } from "../history.ts";
import { DIFFICULTIES, type Cell, type PipsDifficulty, type PipsPuzzle } from "./nyt.ts";
import type { PipsResult } from "./store.ts";

export const PIPS_HOME = "/nyt-pips-hints-answers-today";
export const PIPS_YESTERDAY = "/nyt-pips-hints-answers-yesterday";
export const pipsPath = (isHome: boolean) => (isHome ? PIPS_HOME : PIPS_YESTERDAY);
export const pipsSitemapPaths = () => [PIPS_HOME, PIPS_YESTERDAY];

const CHROME: Chrome = {
  brand: "Pips Answers",
  brandHref: PIPS_HOME,
  gameIcon: "🎲",
  nav: [
    [PIPS_HOME, "Today"],
    [PIPS_YESTERDAY, "Yesterday"],
  ],
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

// The solved board as static SVG: same drawing as public/puzzle-assets/pips.js with every domino placed
const REGION_COLORS = ["#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6", "#0ea5e9", "#f97316", "#84cc16", "#6366f1", "#d97706", "#22c55e", "#06b6d4", "#e11d48"];
const PIP_DOTS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
const regionLabel = (r: PipsPuzzle["regions"][number]) =>
  r.type === "sum" ? String(r.target) : r.type === "greater" ? `>${r.target}` : r.type === "less" ? `<${r.target}` : r.type === "equals" ? "=" : r.type === "unequal" ? "≠" : "";

function pipsBoardSvg(p: PipsPuzzle) {
  const S = 64, PAD = 18;
  const key = (c: Cell) => `${c[0]},${c[1]}`;
  const regionOf = new Map<string, number>();
  let ci = 0;
  const colors = p.regions.map((r, i) => {
    r.indices.forEach((c) => regionOf.set(key(c), i));
    return r.type === "empty" ? "#94a3b8" : REGION_COLORS[ci++ % REGION_COLORS.length];
  });
  const all = p.regions.flatMap((r) => r.indices);
  const rows = Math.max(...all.map((c) => c[0])) + 1;
  const cols = Math.max(...all.map((c) => c[1])) + 1;
  const W = cols * S + PAD * 2, H = rows * S + PAD * 2;
  const at = (c: Cell) => ({ x: PAD + c[1] * S, y: PAD + c[0] * S });
  const dots = (value: number, x: number, y: number) =>
    PIP_DOTS[value].map((i) => `<circle class="pp-dot" cx="${(x + S * (0.27 + 0.23 * (i % 3))).toFixed(1)}" cy="${(y + S * (0.27 + 0.23 * Math.floor(i / 3))).toFixed(1)}" r="${(S * 0.08).toFixed(1)}"/>`).join("");
  let cells = "", edges = "", tiles = "", marks = "";

  p.regions.forEach((r, i) => {
    r.indices.forEach((c) => {
      const { x, y } = at(c);
      cells += `<rect x="${x + 1}" y="${y + 1}" width="${S - 2}" height="${S - 2}" rx="7" style="fill:${colors[i]};fill-opacity:.34"/>`;
      const same = (dr: number, dc: number) => regionOf.get(key([c[0] + dr, c[1] + dc])) === i;
      const line = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${colors[i]}"/>`;
      if (!same(-1, 0)) edges += line(x + 4, y + 4, x + S - 4, y + 4);
      if (!same(1, 0)) edges += line(x + 4, y + S - 4, x + S - 4, y + S - 4);
      if (!same(0, -1)) edges += line(x + 4, y + 4, x + 4, y + S - 4);
      if (!same(0, 1)) edges += line(x + S - 4, y + 4, x + S - 4, y + S - 4);
    });
    const text = regionLabel(r);
    if (text) {
      const last = [...r.indices].sort((a, b) => a[0] - b[0] || a[1] - b[1]).pop()!;
      const cx = at(last).x + S - 4, cy = at(last).y + S - 4;
      marks += `<g class="pp-mark"><rect x="${cx - 13}" y="${cy - 13}" width="26" height="26" rx="5" transform="rotate(45 ${cx} ${cy})" style="fill:${colors[i]}"/><text x="${cx}" y="${cy + 0.5}">${esc(text)}</text></g>`;
    }
  });

  p.solution.forEach(([a, b], i) => {
    const A = at(a), B = at(b);
    const x = Math.min(A.x, B.x) + 2, y = Math.min(A.y, B.y) + 2;
    const horizontal = a[0] === b[0];
    const w = (horizontal ? 2 * S : S) - 4, h = (horizontal ? S : 2 * S) - 4;
    const split = horizontal
      ? `<line class="pp-split" x1="${x + w / 2}" y1="${y + 6}" x2="${x + w / 2}" y2="${y + h - 6}"/>`
      : `<line class="pp-split" x1="${x + 6}" y1="${y + h / 2}" x2="${x + w - 6}" y2="${y + h / 2}"/>`;
    tiles += `<g><rect class="pp-tile" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>${split}${dots(p.dominoes[i][0], A.x, A.y)}${dots(p.dominoes[i][1], B.x, B.y)}</g>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Solved Pips board">${cells}<g class="pp-edges">${edges}</g>${tiles}${marks}</svg>`;
}

function pipsHistory(past: PipsResult[]) {
  return renderHistory({
    title: "Pips Answers History",
    intro: "Every past NYT Pips puzzle, month by month.",
    entries: past.map((r) => ({
      date: r.date,
      heading: `${historyDate(r.date)}`,
      body: historyBoards(DIFFICULTIES.map((d) => historyBoard(pipsBoardSvg(r.puzzles[d]), d[0].toUpperCase() + d.slice(1)))),
    })),
  });
}

export function renderPipsResult(r: PipsResult, nav: { newer: string | null; older: string | null }, isHome: boolean, past: PipsResult[] = []) {
  const data = Object.fromEntries(DIFFICULTIES.map((d) => [d, { ...r.puzzles[d] }]));
  const step = (href: string | null, arrow: string, title: string) =>
    href ? `<a class="pips-step" href="${href}" title="${title}">${arrow}</a>` : `<span class="pips-step" aria-disabled="true">${arrow}</span>`;

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}Pips Solver – Hints &amp; Answers</h1>
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
    ${step(nav.older, "‹", "Previous day")}
    <span class="pips-date">${esc(shortDate(r.date))}, ${r.date.slice(0, 4)}</span>
    ${step(nav.newer, "›", "Next day")}
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

${dateNav(nav)}
${isHome ? pipsHistory(past) : ""}
<script src="/puzzle-assets/pips.js" defer></script>`;

  return layout(
    `Pips Hints & Answers ${isHome ? "Today" : "Yesterday"} (${prettyDate(r.date)}) – NYT Daily Puzzle`,
    `Interactive solver, hints and complete solutions for the easy, medium and hard NYT Pips puzzles on ${prettyDate(r.date)}. Click a domino or a cell to place the correct piece.`,
    body,
    pipsPath(isHome),
    false,
    CHROME
  );
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
      </div>
    </div>`,
    PIPS_HOME,
    true,
    CHROME
  );
}

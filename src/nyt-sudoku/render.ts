import { cellName } from "../solver.ts";
import { esc, dateNav, gameBar, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { historyBoard, historyBoards, historyDate, renderHistory } from "../history.ts";
import { NYT_LEVELS, type NytLevel } from "./nyt.ts";
import type { NytSudokuLevelResult, NytSudokuResult } from "./store.ts";

export const NYT_SUDOKU_HOME = "/nyt-sudoku-hints-answers-today";
export const NYT_SUDOKU_YESTERDAY = "/nyt-sudoku-yesterdays-hints-answers";
export const nytSudokuPath = (isHome: boolean) => (isHome ? NYT_SUDOKU_HOME : NYT_SUDOKU_YESTERDAY);
export const nytSudokuSitemapPaths = () => [NYT_SUDOKU_HOME, NYT_SUDOKU_YESTERDAY];

const CHROME: Chrome = {
  brand: "NYT Sudoku Answers",
  brandHref: NYT_SUDOKU_HOME,
  gameIcon: "🔢",
  nav: [
    [NYT_SUDOKU_HOME, "Today"],
    [NYT_SUDOKU_YESTERDAY, "Yesterday"],
  ],
  footer: "Step-by-step solutions for the daily New York Times Sudoku, computed independently by our open-source solver and checked against the NYT's own answer. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.ns-level[hidden] { display: none !important; }
`,
};

const LABEL: Record<NytLevel, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const LEVEL_NAME = (l: NytLevel) => LABEL[l];

// Solved cells stay blank unless `reveal` (the page fills them in from JS when the solution is shown)
function boardCells(puzzle: string, solution: string, reveal = false) {
  return [...solution]
    .map((d, i) => `<div class="cell ${puzzle[i] !== "0" ? "given" : "solved"}" data-i="${i}">${puzzle[i] !== "0" || reveal ? d : ""}</div>`)
    .join("");
}

function levelSection(l: NytLevel, p: NytSudokuLevelResult, visible: boolean): string {
  const res = p.result;
  const placements = res.steps.filter((s) => s.type === "place").length;

  const steps = res.steps
    .map((s, idx) => {
      const what = s.type === "place" ? `${cellName(s.cell)} = ${s.digit}` : `Remove ${s.removed.length} candidate${s.removed.length > 1 ? "s" : ""}`;
      return `<li data-k="${idx + 1}"><span class="n">${idx + 1}</span><div><span class="t">${esc(s.tech)}</span> · <span style="font-weight:600;color:var(--accent)">${esc(what)}</span><br><span style="color:var(--muted);font-size:13px">${esc(s.why)}</span></div></li>`;
    })
    .join("");

  return `
<div class="gm-stage ns-level" data-level="${l}" id="${l}"${visible ? "" : " hidden"}>
  <section class="gm-card">
    <p class="gm-meta"><span>${LEVEL_NAME(l)} · NYT #${p.id} · ${res.givens} clues</span><span class="ns-count">0 / ${placements} placed</span></p>
    <div class="board-container">
      <div class="board">${boardCells(p.puzzle, res.solution)}</div>
    </div>
    <p class="gm-done ns-done" hidden>✅ Solved – every cell is in place.</p>
  </section>

  <section>
    <p class="gm-help"><b>Place one</b> to reveal the next logical move, <b>play</b> to watch the whole solve, or <b>click any step</b> in the timeline to preview it.</p>
    <div class="gm-actions" style="margin-top:0">
      <button class="gm-btn" data-act="next" type="button">💡 Place one</button>
      <button class="gm-btn primary" data-act="last" type="button">Show full solution</button>
      <button class="gm-btn" data-act="first" type="button">↺ Reset</button>
    </div>

    <div class="controls" style="gap:12px; margin:16px 0 0; justify-content:flex-start">
      <button data-act="prev" title="Previous step">◀</button>
      <button data-act="play" class="primary" style="min-width:105px"><span class="play-icon">▶</span> <span class="play-label">Play</span></button>
      <div class="speed-picker" title="Playback speed">
        <button type="button" class="speed-btn" data-speed="700">0.5x</button>
        <button type="button" class="speed-btn active" data-speed="350">1x</button>
        <button type="button" class="speed-btn" data-speed="150">2x</button>
      </div>
    </div>
    <div class="controls" style="margin:12px 0 0">
      <input class="ns-slider" type="range" min="0" max="${res.steps.length}" value="0" aria-label="Solve step slider">
    </div>

    <div class="caption ns-caption" style="margin-top:14px">
      <span class="step-tag">Ready</span>
      <b>Original puzzle.</b> ${res.givens} clues given.
    </div>

    <details>
      <summary>Step-by-Step Logic Timeline (${res.steps.length} steps)</summary>
      <ol class="steps">${steps}</ol>
    </details>
  </section>
</div>`;
}

// JSON for the inline <script>: "<" is escaped so the data can never close the tag
const jsonForScript = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

function nytSudokuHistory(past: NytSudokuResult[]) {
  return renderHistory({
    title: "NYT Sudoku Solutions History",
    intro: "Every past NYT Sudoku, month by month.",
    entries: past.map((r) => ({
      date: r.date,
      heading: `${historyDate(r.date)}`,
      body: historyBoards(NYT_LEVELS.map((l) => historyBoard(`<div class="board-container"><div class="board">${boardCells(r.levels[l].puzzle, r.levels[l].result.solution, true)}</div></div>`, LEVEL_NAME(l)))),
    })),
  });
}

export function renderNytSudokuResult(r: NytSudokuResult, nav: { newer: string | null; older: string | null }, isHome: boolean, past: NytSudokuResult[] = []) {
  const data = Object.fromEntries(NYT_LEVELS.map((l) => [l, { puzzle: r.levels[l].puzzle, steps: r.levels[l].result.steps }]));

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}NYT Sudoku Solver – Easy, Medium &amp; Hard</h1>
  <div class="sub">
    <span class="badge">NYT Sudoku</span>
    <span class="badge good">✓ Matches the NYT's answer</span>
  </div>
</div>

<div class="gm-app">
${gameBar({
  date: r.date,
  older: nav.older,
  newer: nav.newer,
  tabs: NYT_LEVELS.map((l) => ({ id: l, label: LEVEL_NAME(l) })),
  tabsId: "nsTabs",
  tabAttr: "data-level",
})}

${NYT_LEVELS.map((l) => levelSection(l, r.levels[l], l === "easy")).join("")}
</div>

${dateNav(nav)}
${isHome ? nytSudokuHistory(past) : ""}

<script type="application/json" id="nsData">${jsonForScript(data)}</script>
<script src="/puzzle-assets/nyt-sudoku.js" defer></script>`;

  return layout(
    `NYT Sudoku Answers ${isHome ? "Today" : "Yesterday"} (${prettyDate(r.date)}) – Easy, Medium & Hard Solutions`,
    `Step-by-step logic and the complete solution for the NYT Sudoku easy, medium and hard puzzles on ${prettyDate(r.date)}, checked against the NYT's own answers.`,
    body,
    nytSudokuPath(isHome),
    false,
    CHROME
  );
}

export function renderNytSudokuNotFound(date?: string) {
  return layout(
    "NYT Sudoku Puzzle Not Found",
    "This NYT Sudoku puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🔢</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${date ? `No puzzle for <b>${esc(date)}</b> has been recorded.` : "No NYT Sudoku puzzles are available."}</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${NYT_SUDOKU_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
      </div>
    </div>`,
    NYT_SUDOKU_HOME,
    true,
    CHROME
  );
}

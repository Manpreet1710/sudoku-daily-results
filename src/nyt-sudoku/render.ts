import { cellName } from "../solver.ts";
import { esc, gameBar, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { NYT_LEVELS, type NytLevel } from "./nyt.ts";
import type { NytSudokuLevelResult, NytSudokuResult } from "./store.ts";

export const NYT_SUDOKU_HOME = "/nyt-sudoku";
export const nytSudokuPath = (date: string) => `${NYT_SUDOKU_HOME}/${date}`;
export const nytSudokuSitemapPaths = (dates: string[]) => [NYT_SUDOKU_HOME, `${NYT_SUDOKU_HOME}/archive`, ...dates.map(nytSudokuPath)];

const CHROME: Chrome = {
  brand: "NYT Sudoku Answers",
  brandHref: NYT_SUDOKU_HOME,
  gameIcon: "🔢",
  nav: [
    [NYT_SUDOKU_HOME, "Today"],
    [`${NYT_SUDOKU_HOME}/archive`, "Archive"],
  ],
  footer: "Step-by-step solutions for the daily New York Times Sudoku, computed independently by our open-source solver and checked against the NYT's own answer. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.ns-level[hidden] { display: none !important; }
`,
};

const LABEL: Record<NytLevel, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const LEVEL_NAME = (l: NytLevel) => LABEL[l];

function boardCells(puzzle: string, solution: string) {
  return [...solution]
    .map((d, i) => `<div class="cell ${puzzle[i] !== "0" ? "given" : "solved"}" data-i="${i}">${puzzle[i] !== "0" ? d : ""}</div>`)
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

export function renderNytSudokuResult(r: NytSudokuResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const data = Object.fromEntries(NYT_LEVELS.map((l) => [l, { puzzle: r.levels[l].puzzle, steps: r.levels[l].result.steps }]));

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}NYT Sudoku Solver – Easy, Medium &amp; Hard</h1>
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
  path: nytSudokuPath,
  archive: `${NYT_SUDOKU_HOME}/archive`,
  tabs: NYT_LEVELS.map((l) => ({ id: l, label: LEVEL_NAME(l) })),
  tabsId: "nsTabs",
  tabAttr: "data-level",
})}

${NYT_LEVELS.map((l) => levelSection(l, r.levels[l], l === "easy")).join("")}
</div>

<div class="datenav">
  <span>${nav.older ? `<a href="${nytSudokuPath(nav.older)}" class="prev-day" title="Previous day (Left Arrow)">← ${esc(shortDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${nytSudokuPath(nav.newer)}" class="next-day" title="Next day (Right Arrow)">${esc(shortDate(nav.newer))} →</a>` : ""}</span>
</div>

<script type="application/json" id="nsData">${jsonForScript(data)}</script>
<script src="/assets/nyt-sudoku.js" defer></script>`;

  return layout(
    `NYT Sudoku Answers Today (${prettyDate(r.date)}) – Easy, Medium & Hard Solutions`,
    `Step-by-step logic and the complete solution for the NYT Sudoku easy, medium and hard puzzles on ${prettyDate(r.date)}, checked against the NYT's own answers.`,
    body,
    nytSudokuPath(r.date),
    false,
    CHROME
  );
}

export function renderNytSudokuArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map((d) => `<li data-date="${d}"><a href="${nytSudokuPath(d)}"><b>${esc(prettyDate(d))}</b><span class="date-tag">📅 ${d}</span></a></li>`)
        .join("")}</ul>`
    : `<p class="sub">No NYT Sudoku puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>NYT Sudoku Answers Archive</h1>
  <p class="sub">${dates.length} past NYT Sudoku days with step-by-step solutions</p>
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

  return layout("NYT Sudoku Answers Archive – Past Solutions", "Step-by-step solutions for every past NYT Sudoku puzzle.", body, `${NYT_SUDOKU_HOME}/archive`, false, CHROME);
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
        <a href="${NYT_SUDOKU_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    NYT_SUDOKU_HOME,
    true,
    CHROME
  );
}

import { esc, dateNav, gameBar, GM_REVEAL_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { historyBoard, historyBoards, historyDate, renderHistory } from "../history.ts";
import { BOX_REGIONS, cellName } from "./solver.ts";
import type { MiniSudokuResult } from "./store.ts";

export const MINI_SUDOKU_HOME = "/linkedin-mini-sudoku-answers";
export const MINI_SUDOKU_YESTERDAY = "/yesterdays-linkedin-mini-sudoku-answers";
export const miniSudokuPath = (isHome: boolean) => (isHome ? MINI_SUDOKU_HOME : MINI_SUDOKU_YESTERDAY);
export const miniSudokuSitemapPaths = () => [MINI_SUDOKU_HOME, MINI_SUDOKU_YESTERDAY];

const CHROME: Chrome = {
  brand: "Mini Sudoku Answers",
  brandHref: MINI_SUDOKU_HOME,
  gameIcon: "🧩",
  nav: [
    [MINI_SUDOKU_HOME, "Today"],
    [MINI_SUDOKU_YESTERDAY, "Yesterday"],
  ],
  footer:
    "Hints and step-by-step solutions for the daily LinkedIn Mini Sudoku, computed by our own logic solver. Not affiliated with or endorsed by LinkedIn.",
  css: /* css */ `
.mboard {
  width: min(380px, 100%);
  display: block;
  box-shadow: var(--shadow-lg);
  background: #fff;
}
.mboard text {
  font-family: var(--font-sans);
  font-size: 28px;
  text-anchor: middle;
  dominant-baseline: central;
  user-select: none;
}
.mboard .given { font-weight: 800; fill: #111827; }
.mboard .solved { font-weight: 600; fill: #4f46e5; }
.sol-row {
  display: block;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--soft);
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 13px;
  margin: 3px 0;
}
`,
};

const U = 58;
const N = 6;

// 6x6 grid with its six regions outlined; with `solution`, empty cells show the answer in the accent color
function boardSvg(puzzle: string, regions: number[], solution?: string) {
  const W = N * U;
  const digits = [...puzzle]
    .map((d, i) => {
      const x = (i % N) * U + U / 2, y = Math.floor(i / N) * U + U / 2 + 2;
      if (d !== "0") return `<text class="given" x="${x}" y="${y}">${d}</text>`;
      return solution ? `<text class="solved" x="${x}" y="${y}">${solution[i]}</text>` : "";
    })
    .join("");
  const thin = Array.from({ length: N - 1 }, (_, k) => `M${(k + 1) * U} 0v${W}M0 ${(k + 1) * U}h${W}`).join("");
  // A thick line wherever two neighbouring cells belong to different regions
  let thick = "";
  for (let i = 0; i < 36; i++) {
    const r = Math.floor(i / N), c = i % N;
    if (c < N - 1 && regions[i] !== regions[i + 1]) thick += `M${(c + 1) * U} ${r * U}v${U}`;
    if (r < N - 1 && regions[i] !== regions[i + N]) thick += `M${c * U} ${(r + 1) * U}h${U}`;
  }
  const label = solution ? `Solved Mini Sudoku grid: ${solution}` : `Mini Sudoku grid, row by row: ${puzzle.replace(/0/g, ".")}`;
  return `<svg class="mboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img" aria-label="${esc(label)}"><rect width="${W}" height="${W}" fill="#fff"/><path d="${thin}" stroke="#cbd5e1" stroke-width="1.5" fill="none"/><path d="${thick}" stroke="#1e293b" stroke-width="3" fill="none"/><rect width="${W}" height="${W}" fill="none" stroke="#1e293b" stroke-width="3.5"/>${digits}</svg>`;
}

const level = (r: MiniSudokuResult) => (!r.logical ? "Hard" : r.steps.some((s) => s.tech === "Naked Pair" || s.tech === "Pointing") ? "Medium" : "Easy");

function miniSudokuHistory(past: MiniSudokuResult[]) {
  return renderHistory({
    title: "Mini Sudoku Solutions History",
    intro: "Every past LinkedIn Mini Sudoku, month by month.",
    entries: past.map((r) => ({
      date: r.date,
      heading: `${historyDate(r.date)}`,
      body: historyBoards([historyBoard(boardSvg(r.puzzle, r.regions ?? BOX_REGIONS, r.solution), esc(r.name ?? "Mini Sudoku"))]),
    })),
  });
}

export function renderMiniSudokuResult(r: MiniSudokuResult, nav: { newer: string | null; older: string | null }, isHome: boolean, past: MiniSudokuResult[] = []) {
  const givens = [...r.puzzle].filter((d) => d !== "0").length;
  const moves = r.steps.filter((s) => s.cell !== undefined).length;
  const lv = level(r);
  const regions = r.regions ?? BOX_REGIONS;
  const boxes = regions.every((g, i) => g === BOX_REGIONS[i]);
  // The first placements double as hints; collapsed so nothing is spoiled until opened
  const hints = r.steps
    .filter((s) => s.cell !== undefined)
    .slice(0, 3)
    .map((s, i) => `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Next move</summary><p style="margin-top:12px;font-size:15px">Look at ${esc(cellName(s.cell!))}. ${esc(s.tech)}: ${esc(s.text.split(": ").slice(1).join(": "))}</p></details>`)
    .join("");
  const rows = Array.from({ length: N }, (_, i) => `<span class="sol-row"><b>Row ${i + 1}:</b> ${[...r.solution.slice(i * N, i * N + N)].join(" ")}</span>`).join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}LinkedIn Mini Sudoku Answers</h1>
  <div class="sub">
    <span class="badge">${lv}</span>
    <span class="badge good">LinkedIn Mini Sudoku</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer })}
  <div class="gm-stage">
    <div class="gm-card">
      <p class="gm-meta"><span>${r.puzzleId ? `Puzzle #${r.puzzleId}` : "6×6"}${r.name ? ` · ${esc(r.name)}` : ""} · ${givens} given digits · ${moves} moves</span><span>${lv}</span></p>
      <div class="gm-board" data-gm-view="puzzle">${boardSvg(r.puzzle, regions)}</div>
      <div class="gm-board" data-gm-view="solution" hidden>${boardSvg(r.puzzle, regions, r.solution)}</div>
    </div>
    <div>
      <p class="gm-help">Fill the grid so every <b>row</b>, <b>column</b> and ${boxes ? "<b>2×3 box</b>" : "<b>outlined region</b>"} holds the digits <b>1 to 6</b> exactly once.</p>
      ${hints}
      <details>
        <summary>Step-by-Step Logic Timeline (${r.steps.length} steps)</summary>
        <ol class="steps" style="margin-top:14px">${r.steps
          .map((s, i) => `<li><span class="n">${i + 1}</span><div><span class="t">${esc(s.tech)}</span><br><span style="color:var(--ink-2);font-size:14px">${esc(s.text)}</span></div></li>`)
          .join("")}</ol>${r.logical ? "" : '<p style="font-size:13px;color:var(--muted);margin-top:10px">The last steps needed a trial, so they are not explained by simple rules.</p>'}
      </details>
      <div class="gm-actions">
        <button class="gm-btn primary" type="button" data-gm-reveal="Show full solution">Show full solution</button>
      </div>
      <div data-gm-solution-only hidden style="margin-top:14px">${rows}</div>
    </div>
  </div>
</div>

${dateNav(nav)}
${isHome ? miniSudokuHistory(past) : ""}
${GM_REVEAL_SCRIPT}`;

  return layout(
    `LinkedIn Mini Sudoku Answers ${isHome ? "Today" : "Yesterday"} (${prettyDate(r.date)}) – Solution & Hints`,
    `Hints, step-by-step logic and the full solution for the LinkedIn Mini Sudoku on ${prettyDate(r.date)}.`,
    body,
    miniSudokuPath(isHome),
    false,
    CHROME,
  );
}

export function renderMiniSudokuNotFound(date?: string) {
  return layout(
    "Mini Sudoku Not Found",
    "This Mini Sudoku is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🧩</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been added yet.` : "No Mini Sudoku results are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${MINI_SUDOKU_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
      </div>
    </div>`,
    MINI_SUDOKU_HOME,
    true,
    CHROME,
  );
}

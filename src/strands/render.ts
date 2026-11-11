import { esc, dateNav, gameBar, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { historyBoard, historyBoards, historyDate, historyRow, renderHistory } from "../history.ts";
import { cellCol, cellRow, spansBoard } from "./solver.ts";
import type { StrandsResult } from "./store.ts";

export const STRANDS_HOME = "/nyt-strands-hints-spangram-answers-today";
export const STRANDS_YESTERDAY = "/nyt-strands-hints-spangram-answers-yesterday";
export const strandsPath = (isHome: boolean) => (isHome ? STRANDS_HOME : STRANDS_YESTERDAY);
export const strandsSitemapPaths = () => [STRANDS_HOME, STRANDS_YESTERDAY];

const CHROME: Chrome = {
  brand: "Strands Answers",
  brandHref: STRANDS_HOME,
  gameIcon: "🔤",
  nav: [
    [STRANDS_HOME, "Today"],
    [STRANDS_YESTERDAY, "Yesterday"],
  ],
  css: /* css */ `
.splay-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 14px; }
.sboard-wrap {
  display: flex;
  justify-content: center;
  margin: 16px 0 24px;
}
.sboard {
  width: min(340px, 100%);
  display: block;
  padding: 10px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
}
.sboard circle.dot {
  fill: var(--soft);
  stroke: var(--line);
  stroke-width: 1.5;
}
.sboard text {
  font-family: var(--font-sans);
  font-size: 21px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: central;
  fill: var(--ink);
  user-select: none;
}
.sboard path.line {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.55;
}
.gw {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.gw span {
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.gw span.pg {
  background: linear-gradient(135deg, #fef08a 0%, #fde047 100%);
  border-color: #eab308;
  color: #713f12;
  font-weight: 800;
}
.slayout-note {
  font-size: 13px;
  color: var(--muted);
  margin: 10px 0 0;
}
`,
};

const U = 52;
const COLS = 6;
const ROWS = 8;
const SPANGRAM_COLOR = "#facc15";
const WORD_COLORS = ["#38bdf8", "#818cf8", "#34d399", "#fb923c", "#f472b6", "#2dd4bf", "#a78bfa"];

const centre = (i: number) => [cellCol(i) * U + U / 2, cellRow(i) * U + U / 2] as const;

// The 6x8 letter grid; with `placements`, every word is traced over it in its own color
function boardSvg(board: string[], placements?: StrandsResult["placements"]) {
  const color = (i: number) => (placements?.[i].spangram ? SPANGRAM_COLOR : WORD_COLORS[(i - 1) % WORD_COLORS.length]);
  const owner = new Map<number, number>();
  placements?.forEach((p, i) => p.cells.forEach((c) => owner.set(c, i)));

  const lines = (placements ?? [])
    .map((p, i) => `<path class="line" stroke="${color(i)}" d="${p.cells.map((c, k) => `${k ? "L" : "M"}${centre(c).join(" ")}`).join("")}"/>`)
    .join("");
  const dots = board
    .join("")
    .split("")
    .map((ch, i) => {
      const [x, y] = centre(i);
      const o = owner.get(i);
      const fill = o === undefined ? "" : ` style="fill:${color(o)};stroke:${color(o)}"`;
      return `<circle class="dot" cx="${x}" cy="${y}" r="19"${fill}/><text x="${x}" y="${y + 1}"${o !== undefined ? ' style="fill:#111827"' : ""}>${esc(ch)}</text>`;
    })
    .join("");

  const label = placements
    ? `Strands board with every word marked: ${placements.map((p) => p.word).join(", ")}`
    : `Strands letter board: ${board.join(", ")}`;
  return `<div class="sboard-wrap"><svg class="sboard" viewBox="0 0 ${COLS * U} ${ROWS * U}" role="img" aria-label="${esc(label)}">${lines}${dots}</svg></div>`;
}

function hints(r: StrandsResult) {
  const [spangram, ...words] = r.placements;
  const side = spansBoard(spangram.cells) && new Set(spangram.cells.map(cellCol)).size === COLS ? "left edge to the right edge" : "top row to the bottom row";
  const lengths = words.map((w) => w.word.length).sort((a, b) => a - b);
  const list = [
    `The theme clue is: "${r.clue}"`,
    `There are ${words.length} theme words plus the spangram. The theme words have ${lengths.join(", ")} letters.`,
    `The theme words start with: ${words.map((w) => w.word[0]).sort().join(", ")}.`,
    `The spangram has ${spangram.word.length} letters and runs from ${r.unique ? side : "one side of the board to the opposite side"}. It starts with "${spangram.word[0]}" and ends with "${spangram.word.at(-1)}".`,
  ];
  // Where the spangram begins is only a fact when the board has a single possible layout
  if (r.unique) list.push(`The spangram starts in row ${cellRow(spangram.cells[0]) + 1}, column ${cellCol(spangram.cells[0]) + 1}.`);
  return list;
}

function strandsHistory(past: StrandsResult[]) {
  return renderHistory({
    title: "Strands Answers History",
    intro: "Every past Strands puzzle with its theme, spangram and theme words.",
    entries: past.map((r) => ({
      date: r.date,
      heading: `${historyDate(r.date)}`,
      body: historyBoards([historyBoard(boardSvg(r.board, r.placements), esc(r.clue))]) + historyRow("Spangram", esc(r.placements.find((p) => p.spangram)?.word ?? "")) + historyRow("Theme words", r.placements.filter((p) => !p.spangram).map((p) => esc(p.word)).join(", ")),
    })),
  });
}

// Reveal all swaps in the solved board and the word list; Clear all swaps them back
const STRANDS_PLAY_SCRIPT = `<script>
(() => {
  const all = document.querySelector("[data-s-all]");
  if (!all) return;
  const puzzle = document.querySelector('[data-gm-view="puzzle"]');
  const solved = document.querySelector('[data-gm-view="solution"]');
  const extra = document.querySelectorAll("[data-gm-solution-only]");
  const show = (on) => {
    puzzle.hidden = on;
    solved.hidden = !on;
    extra.forEach((e) => { e.hidden = !on; });
  };
  all.addEventListener("click", () => show(true));
  document.querySelector("[data-s-clear]").addEventListener("click", () => show(false));
})();
</script>`;

export function renderStrandsResult(r: StrandsResult, nav: { newer: string | null; older: string | null }, isHome: boolean, past: StrandsResult[] = []) {
  const [spangram, ...words] = r.placements;
  const hintHtml = hints(r)
    .map((h, i) => `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Clue</summary><p style="margin-top:12px;font-size:15px">${esc(h)}</p></details>`)
    .join("");
  const wordChips = [...words].sort((a, b) => (a.word < b.word ? -1 : 1)).map((w) => `<span>${esc(w.word)}</span>`).join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}Strands Hints &amp; Answers</h1>
  <div class="sub">
    <span class="badge">NYT Strands</span>
    <span class="badge good">${words.length + 1} Words</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer })}
  <div class="gm-stage">
    <div class="gm-card">
      <div class="gm-board" data-gm-view="puzzle">${boardSvg(r.board)}</div>
      <div class="gm-board" data-gm-view="solution" hidden>${boardSvg(r.board, r.placements)}</div>
      <div class="splay-actions">
        <button type="button" class="gm-btn primary" data-s-all>Reveal all</button>
        <button type="button" class="gm-btn" data-s-clear>Clear all</button>
      </div>
    </div>
    <div>
      <p class="gm-help">Join <b>touching letters</b> (diagonals count) to spell the theme words. With the spangram, they use every letter exactly once.</p>
      ${hintHtml}
      <div data-gm-solution-only hidden style="margin-top:14px">
        <p style="font-size:14px;margin:0 0 6px"><b>🧵 Spangram</b></p>
        <div class="gw"><span class="pg">${esc(spangram.word)}</span></div>
        <p style="font-size:14px;margin:14px 0 6px"><b>${words.length} theme words</b></p>
        <div class="gw">${wordChips}</div>
        ${r.unique ? "" : '<p class="slayout-note">Several layouts fit these words on this board. The words are the same in all of them; this is one valid way to place them.</p>'}
      </div>
    </div>
  </div>
</div>

${dateNav(nav)}
${isHome ? strandsHistory(past) : ""}
${STRANDS_PLAY_SCRIPT}`;

  return layout(
    `Strands Hints & Answers ${isHome ? "Today" : "Yesterday"} (${prettyDate(r.date)}) – NYT Puzzle`,
    `Hints for the NYT Strands theme "${r.clue}" on ${prettyDate(r.date)}, then the spangram, every theme word and the solved board.`,
    body,
    strandsPath(isHome),
    false,
    CHROME,
  );
}

export function renderStrandsNotFound(date?: string) {
  return layout(
    "Strands Puzzle Not Found",
    "This Strands puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🔤</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Strands results are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${STRANDS_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
      </div>
    </div>`,
    STRANDS_HOME,
    true,
    CHROME,
  );
}

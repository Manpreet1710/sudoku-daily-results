import { esc, gameBar, GM_REVEAL_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { cellCol, cellRow, spansBoard } from "./solver.ts";
import type { StrandsResult } from "./store.ts";

export const STRANDS_HOME = "/strands";
export const strandsPath = (date: string) => `${STRANDS_HOME}/${date}`;
export const strandsSitemapPaths = (dates: string[]) => [STRANDS_HOME, `${STRANDS_HOME}/archive`, ...dates.map(strandsPath)];

const CHROME: Chrome = {
  brand: "Strands Answers",
  brandHref: STRANDS_HOME,
  gameIcon: "🔤",
  nav: [
    [STRANDS_HOME, "Today"],
    [`${STRANDS_HOME}/archive`, "Archive"],
  ],
  footer:
    "Daily hints and answers for the New York Times Strands. Word positions are worked out by our own solver. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
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

export function renderStrandsResult(r: StrandsResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const [spangram, ...words] = r.placements;
  const hintHtml = hints(r)
    .map((h, i) => `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Clue</summary><p style="margin-top:12px;font-size:15px">${esc(h)}</p></details>`)
    .join("");
  const wordChips = [...words].sort((a, b) => (a.word < b.word ? -1 : 1)).map((w) => `<span>${esc(w.word)}</span>`).join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Strands Hints &amp; Answers</h1>
  <div class="sub">
    <span class="badge">NYT Strands</span>
    <span class="badge good">${words.length + 1} Words</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer, path: strandsPath, archive: `${STRANDS_HOME}/archive` })}
  <div class="gm-stage">
    <div class="gm-card">
      <p class="gm-meta"><span>6×8 · ${words.length} theme words + spangram</span><span>Spangram ${spangram.word.length} letters</span></p>
      <div class="gm-board" data-gm-view="puzzle">${boardSvg(r.board)}</div>
      <div class="gm-board" data-gm-view="solution" hidden>${boardSvg(r.board, r.placements)}</div>
    </div>
    <div>
      <p class="gm-help">Join <b>touching letters</b> (diagonals count) to spell the theme words. With the spangram, they use every letter exactly once.</p>
      ${hintHtml}
      <div class="gm-actions">
        <button class="gm-btn primary" type="button" data-gm-reveal="Show full solution">Show full solution</button>
      </div>
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

<div class="datenav">
  <span>${nav.older ? `<a href="${strandsPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${strandsPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>` : ""}</span>
</div>
${GM_REVEAL_SCRIPT}`;

  return layout(
    `Strands Hints & Answers Today (${prettyDate(r.date)}) – NYT Puzzle`,
    `Hints for the NYT Strands theme "${r.clue}" on ${prettyDate(r.date)}, then the spangram, every theme word and the solved board.`,
    body,
    strandsPath(r.date),
    false,
    CHROME,
  );
}

export function renderStrandsArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map((d) => `<li data-date="${d}"><a href="${strandsPath(d)}"><b>${esc(prettyDate(d))}</b><span class="date-tag">📅 ${d}</span></a></li>`)
        .join("")}</ul>`
    : `<p class="sub">No Strands puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Strands Answers Archive</h1>
  <p class="sub">${dates.length} past NYT Strands puzzles and solutions</p>
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

  return layout("Strands Answers Archive – Past Hints & Solutions", "Hints and answers for every past NYT Strands puzzle.", body, `${STRANDS_HOME}/archive`, false, CHROME);
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
        <a href="${STRANDS_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    STRANDS_HOME,
    true,
    CHROME,
  );
}

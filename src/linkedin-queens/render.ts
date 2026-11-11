import { esc, dateNav, gameBar, GM_TABS_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { historyBoard, historyBoards, historyDate, renderHistory } from "../history.ts";
import type { QueensPuzzleResult, LinkedInQueensResult } from "./store.ts";

export const LINKEDIN_QUEENS_HOME = "/linkedin-queens-answer-today";
export const LINKEDIN_QUEENS_YESTERDAY = "/linkedin-queens-answer-yesterday";
export const linkedinQueensPath = (isHome: boolean) => (isHome ? LINKEDIN_QUEENS_HOME : LINKEDIN_QUEENS_YESTERDAY);
export const linkedinQueensSitemapPaths = () => [LINKEDIN_QUEENS_HOME, LINKEDIN_QUEENS_YESTERDAY];

const CHROME: Chrome = {
  brand: "LinkedIn Queens Answers",
  brandHref: LINKEDIN_QUEENS_HOME,
  gameIcon: "👑",
  nav: [
    [LINKEDIN_QUEENS_HOME, "Today"],
    [LINKEDIN_QUEENS_YESTERDAY, "Yesterday"],
  ],
  css: /* css */ `
.qboard {
  width: min(440px, 100%);
  display: block;
  margin: 0 auto;
  box-shadow: var(--shadow);
}
.qboard text {
  font-size: 26px;
  text-anchor: middle;
  dominant-baseline: central;
  fill: #0f172a;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}
/* Square corners like LinkedIn's board */
.gm-board svg.qboard { border-radius: 0; }
.gm-board.qplay { display: block; }
.qboard .qhit { fill: transparent; cursor: pointer; }
.qboard .qhit:hover { fill: rgba(0, 0, 0, 0.08); }
.qboard text.qx { font-size: 20px; font-weight: 700; fill: #1e293b; filter: none; }
.qzones { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.qzone, .qzone:hover {
  background: var(--z);
  border: 1px solid rgba(0, 0, 0, 0.18);
  color: #0f172a;
  min-height: 38px;
  padding: 6px 12px;
  font-size: 13px;
  text-transform: capitalize;
}
.qzone:hover { filter: brightness(0.95); }
.qzone .qz-box {
  width: 16px;
  height: 16px;
  border: 1.5px solid #0f172a;
  border-radius: 4px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
}
.qzone.done .qz-box::after { content: "✓"; font-weight: 800; }
.qplay-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 14px; }
.coord-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: 13px;
  margin: 2px 4px;
}
`,
};

// LinkedIn's own region colors; older stored boards named by order still get a color
const PALETTE: Record<string, string> = {
  purple: "#bba3e2",
  orange: "#ffc992",
  blue: "#96beff",
  green: "#b3dfa0",
  gray: "#dfdfdf",
  red: "#ff7b60",
  yellow: "#e6f388",
  brown: "#b9b29e",
  pink: "#dfa0bf",
  teal: "#a3d2d8",
  cyan: "#62efea",
  lime: "#d9f99d",
  gold: "#fde047",
};
const fill = (name: string, i: number) => PALETTE[name] ?? `hsl(${(i * 47) % 360} 65% 78%)`;

const LEVELS = ["", "Easy", "Medium", "Hard", "Expert"];

// `play` adds a tap target on every cell and an empty layer for the ♛ / × marks the page script draws
function boardSvg(p: QueensPuzzleResult, solved: boolean, play = false) {
  const n = p.size,
    u = 40,
    W = n * u;
  const rects = p.grid
    .flatMap((row, r) =>
      row.map((g, c) => `<rect x="${c * u}" y="${r * u}" width="${u}" height="${u}" fill="${fill(p.colors[g], g)}"/>`)
    )
    .join("");

  let thin = "",
    thick = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (c < n - 1) {
        const l = `M${(c + 1) * u} ${r * u}v${u}`;
        if (p.grid[r][c] === p.grid[r][c + 1]) thin += l;
        else thick += l;
      }
      if (r < n - 1) {
        const l = `M${c * u} ${(r + 1) * u}h${u}`;
        if (p.grid[r][c] === p.grid[r + 1][c]) thin += l;
        else thick += l;
      }
    }
  const queens = (solved ? p.queens : [])
    .map(([r, c]) => `<text x="${c * u + u / 2}" y="${r * u + u / 2 + 1}">♛</text>`)
    .join("");
  const hits = play
    ? p.grid.flatMap((row, r) => row.map((_, c) => `<rect class="qhit" x="${c * u}" y="${r * u}" width="${u}" height="${u}" data-r="${r}" data-c="${c}"/>`)).join("") +
      '<g class="qmarks"></g>'
    : "";
  const label = solved
    ? `${n} by ${n} Queens solution: ${p.queens.map(([r, c]) => `row ${r + 1} column ${c + 1}`).join("; ")}`
    : `${n} by ${n} Queens board with ${p.colors.length} colour regions`;

  return `<svg class="qboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img"${play ? ` data-queens="${p.queens.map(([r, c]) => `${r},${c}`).join(" ")}"` : ""} aria-label="${esc(
    label
  )}">${rects}<path d="${thin}" stroke="#000" stroke-opacity=".55" stroke-width="1" fill="none"/><path d="${thick}" stroke="#000" stroke-width="3" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#000" stroke-width="4"/>${queens}${hits}</svg>`;
}

function puzzleSection(p: QueensPuzzleResult, i: number) {
  const id = `${p.size}x${p.size}`;
  // One button per colour region; it reveals that region's queen
  const zones = `<div class="qzones">${p.colors
    .map((c, k) => {
      const q = p.queens.find(([r, col]) => p.grid[r][col] === k);
      return q ? `<button type="button" class="qzone" style="--z:${fill(c, k)}" data-q="${q[0]},${q[1]}"><span class="qz-box"></span>${esc(c)}</button>` : "";
    })
    .join("")}</div>`;
  const coords = p.queens
    .map(([r, c]) => `<span class="coord-badge">Row ${r + 1}, Col ${c + 1}</span>`)
    .join(" ");

  return `
<div class="gm-stage" data-gm-panel="${id}" id="${id}"${i === 0 ? "" : " hidden"}>
  <div class="gm-card">
    <div class="gm-board qplay" data-gm-view="puzzle">
      ${boardSvg(p, false, true)}
      <div class="qplay-actions">
        <button type="button" class="gm-btn primary" data-q-all>Reveal all</button>
        <button type="button" class="gm-btn" data-q-clear>Clear all</button>
      </div>
    </div>
  </div>
  <div>
    <p class="gm-help"><b>Place ${p.size} queens</b> – one in every row, column and colour region, with no two touching, not even diagonally. <b>Tap any cell</b> to reveal a ♛ or ×, or tap a <b>colour</b> to reveal the queen in that region.</p>
    ${zones}
    <div data-gm-solution-only hidden style="margin-top:14px">
      <p style="font-size:14px;margin:0 0 6px"><b>Queen Coordinates</b></p>
      ${coords}
      ${p.unique ? "" : '<p style="font-size:13px;color:var(--muted);margin-top:8px">Note: Multiple valid solutions exist; this is one proven arrangement.</p>'}
    </div>
  </div>
</div>`;
}

// Cell-by-cell and region-by-region reveal on the puzzle board
const QUEENS_PLAY_SCRIPT = `<script>
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const U = 40;
  document.querySelectorAll(".qplay").forEach((card) => {
    const svg = card.querySelector("svg[data-queens]");
    const marks = svg.querySelector(".qmarks");
    const queens = svg.dataset.queens.split(" ");
    const stage = card.closest(".gm-stage");
    const zones = [...stage.querySelectorAll(".qzone")];
    const coords = stage.querySelectorAll("[data-gm-solution-only]");
    const shown = new Set();
    const sync = () => {
      const all = queens.every((k) => shown.has(k));
      coords.forEach((e) => { e.hidden = !all; });
    };
    const mark = (k) => {
      if (shown.has(k)) return;
      shown.add(k);
      const [r, c] = k.split(",").map(Number);
      const isQueen = queens.includes(k);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("x", c * U + U / 2);
      t.setAttribute("y", r * U + U / 2 + 1);
      if (!isQueen) t.setAttribute("class", "qx");
      t.textContent = isQueen ? "♛" : "×";
      marks.appendChild(t);
      zones.forEach((z) => { if (z.dataset.q === k) z.classList.add("done"); });
      sync();
    };
    svg.querySelectorAll(".qhit").forEach((h) => h.addEventListener("click", () => mark(h.dataset.r + "," + h.dataset.c)));
    zones.forEach((z) => z.addEventListener("click", () => mark(z.dataset.q)));
    card.querySelector("[data-q-all]").addEventListener("click", () => queens.forEach(mark));
    card.querySelector("[data-q-clear]").addEventListener("click", () => {
      marks.textContent = "";
      shown.clear();
      zones.forEach((z) => z.classList.remove("done"));
      sync();
    });
  });
})();
</script>`;

function linkedInQueensHistory(past: LinkedInQueensResult[]) {
  return renderHistory({
    title: "LinkedIn Queens Solutions History",
    intro: "Every past LinkedIn Queens puzzle, month by month.",
    entries: past.map((r) => ({
      date: r.date,
      heading: `${historyDate(r.date)}`,
      body: historyBoards(r.puzzles.map((p) => historyBoard(boardSvg(p, true), `${p.size}×${p.size}`))),
    })),
  });
}

export function renderLinkedInQueensResult(
  r: LinkedInQueensResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean, past: LinkedInQueensResult[] = []) {
  const sizes = r.puzzles.map((p) => `${p.size}×${p.size}`);
  const single = r.puzzles.length === 1 ? r.puzzles[0] : null;

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}Queens Game Answers &amp; Solutions</h1>
  <div class="sub">
    <span class="badge good">Puzzle #${r.puzzleId}</span>
    ${single && LEVELS[single.level] ? `<span class="badge">${LEVELS[single.level]}</span>` : ""}
    ${single ? `<span class="badge">${sizes[0]}</span>` : ""}
  </div>
</div>

<div class="gm-app">
  ${gameBar({
    date: r.date,
    older: nav.older,
    newer: nav.newer,
    // A lone size is already in the badges above, so tabs only appear when there is a choice
    tabs: single ? [] : r.puzzles.map((p) => ({ id: `${p.size}x${p.size}`, label: `${p.size}×${p.size}` })),
  })}
  ${r.puzzles.map(puzzleSection).join("")}
</div>

${dateNav(nav)}
${isHome ? linkedInQueensHistory(past) : ""}
${GM_TABS_SCRIPT}${QUEENS_PLAY_SCRIPT}`;

  return layout(
    `Queens Game Answers ${isHome ? "Today" : "Yesterday"} (${prettyDate(r.date)}) – Daily Solutions`,
    `Step-by-step logic, hints and verified queen coordinates for the ${sizes.join(
      ", "
    )} daily Queens puzzles on ${prettyDate(r.date)}.`,
    body,
    linkedinQueensPath(isHome),
    false,
    CHROME
  );
}

export function renderLinkedInQueensNotFound(date?: string) {
  return layout(
    "Queens Puzzle Not Found",
    "This Queens puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">👑</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Queens puzzles are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${LINKEDIN_QUEENS_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
      </div>
    </div>`,
    LINKEDIN_QUEENS_HOME,
    true,
    CHROME
  );
}

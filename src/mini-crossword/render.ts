import { esc, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import type { MiniEntry, MiniPuzzle } from "./api.ts";
import type { MiniResult } from "./store.ts";

export const MINI_CROSSWORD_HOME = "/mini-crossword";
export const miniPath = (date: string) => `${MINI_CROSSWORD_HOME}/${date}`;
export const miniSitemapPaths = (dates: string[]) => [MINI_CROSSWORD_HOME, `${MINI_CROSSWORD_HOME}/archive`, ...dates.map(miniPath)];

const CHROME: Chrome = {
  brand: "Mini Crossword Answers",
  brandHref: MINI_CROSSWORD_HOME,
  gameIcon: "✏️",
  nav: [
    [MINI_CROSSWORD_HOME, "Today"],
    [`${MINI_CROSSWORD_HOME}/archive`, "Archive"],
  ],
  footer:
    "Clues, hints and answers for the daily Mini Crossword on minicrossword.com. Not affiliated with or endorsed by that site.",
  css: /* css */ `
.xboard-wrap {
  display: flex;
  justify-content: center;
  margin: 16px 0 24px;
}
.xboard {
  width: min(380px, 100%);
  display: block;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: #fff;
}
.xboard text {
  font-family: var(--font-sans);
  text-anchor: middle;
  dominant-baseline: central;
  fill: #111827;
  user-select: none;
}
.xboard .num {
  font-size: 11px;
  font-weight: 700;
  text-anchor: start;
  dominant-baseline: hanging;
  fill: #475569;
}
.xboard .ch {
  font-size: 26px;
  font-weight: 800;
}
.cw-clues {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 8px 24px;
  margin-top: 12px;
}
.cw-clues h3 {
  margin: 8px 0 10px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.cw-clues details {
  margin-bottom: 8px;
}
.cw-clues summary {
  font-weight: 500;
  font-size: 15px;
}
.cw-clues summary b {
  color: var(--accent);
  margin-right: 6px;
}
.cw-clues summary small {
  color: var(--muted);
  margin-left: 6px;
}
.cw-clues .hint {
  margin: 12px 0 8px;
  font-size: 14px;
  color: var(--ink-2);
}
.cw-ans {
  display: inline-block;
  padding: 6px 14px;
  margin-bottom: 4px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-weight: 800;
  letter-spacing: 0.18em;
  font-size: 15px;
}
`,
};

const U = 56;
const LEVELS = { easy: "Easy", hard: "Hard" } as const;

// The grid with clue numbers; with `solved`, every white square also shows its letter
function boardSvg(p: MiniPuzzle, solved: boolean) {
  const n = p.size, W = n * U;
  const letters = new Map<number, string>();
  for (const e of p.across) [...e.answer].forEach((ch, k) => letters.set(e.row * n + e.col + k, ch));
  for (const e of p.down) [...e.answer].forEach((ch, k) => letters.set((e.row + k) * n + e.col, ch));

  const cells = p.blocks
    .map((black, i) => {
      const x = (i % n) * U, y = Math.floor(i / n) * U;
      if (black) return `<rect x="${x}" y="${y}" width="${U}" height="${U}" fill="#1e293b"/>`;
      const num = p.numbers[i] ? `<text class="num" x="${x + 4}" y="${y + 4}">${p.numbers[i]}</text>` : "";
      const ch = solved ? `<text class="ch" x="${x + U / 2}" y="${y + U / 2 + 5}">${esc(letters.get(i) ?? "")}</text>` : "";
      return `<rect x="${x}" y="${y}" width="${U}" height="${U}" fill="#fff"/>${num}${ch}`;
    })
    .join("");
  const lines = Array.from({ length: n - 1 }, (_, k) => `M${(k + 1) * U} 0v${W}M0 ${(k + 1) * U}h${W}`).join("");
  const label = solved ? `Solved ${n} by ${n} mini crossword grid` : `Empty ${n} by ${n} mini crossword grid with clue numbers`;
  return `<div class="xboard-wrap"><svg class="xboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img" aria-label="${esc(label)}">${cells}<path d="${lines}" stroke="#cbd5e1" stroke-width="1.5" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#1e293b" stroke-width="3"/></svg></div>`;
}

const clue = (e: MiniEntry, dir: "A" | "D") =>
  `<details><summary><b>${e.number}${dir}</b>${esc(e.clue)}<small>(${e.answer.length})</small></summary>${
    e.hint ? `<p class="hint"><b>Hint:</b> ${esc(e.hint)}</p>` : ""
  }<span class="cw-ans">${esc(e.answer)}</span></details>`;

function puzzleSection(p: MiniPuzzle) {
  const words = p.across.length + p.down.length;
  return `
<h2 id="${p.level}">${p.size}×${p.size} ${LEVELS[p.level]} Mini Crossword</h2>
<p class="sub" style="font-size:14px; margin-bottom:12px">${p.title ? `<b>${esc(p.title)}</b>` : ""}${p.byline ? ` · edited by ${esc(p.byline)}` : ""} · ${words} clues. Open a clue for its hint, then the answer.</p>
${boardSvg(p, false)}
<div class="cw-clues">
  <div><h3>Across</h3>${p.across.map((e) => clue(e, "A")).join("")}</div>
  <div><h3>Down</h3>${p.down.map((e) => clue(e, "D")).join("")}</div>
</div>
<details>
  <summary style="color:var(--accent);font-weight:700">✏️ Show the Solved ${LEVELS[p.level]} Grid (Spoiler)</summary>
  <div style="margin-top:16px">${boardSvg(p, true)}</div>
</details>`;
}

export function renderMiniResult(r: MiniResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const jump = r.puzzles.map((p) => `<a href="#${p.level}">${LEVELS[p.level]}</a>`).join(" · ");
  const sizes = [...new Set(r.puzzles.map((p) => `${p.size}×${p.size}`))].join(" / ");
  const clues = r.puzzles.reduce((n, p) => n + p.across.length + p.down.length, 0);

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Mini Crossword Answers</h1>
  <div class="sub">
    <span>📅 ${esc(prettyDate(r.date))}</span>
    <span class="badge">${esc(sizes)} Grid</span>
    <span class="badge good">${r.puzzles.length} Puzzle${r.puzzles.length === 1 ? "" : "s"}</span>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="k">Grid Size</div><div class="v">${esc(sizes)}</div></div>
  <div class="stat"><div class="k">Difficulties</div><div class="v" style="font-size:20px">${r.puzzles.map((p) => LEVELS[p.level]).join(" + ")}</div></div>
  <div class="stat"><div class="k">Total Clues</div><div class="v">${clues}</div></div>
  <div class="stat"><div class="k">Jump To</div><div class="v" style="font-size:18px">${jump}</div></div>
</div>

${r.puzzles.map(puzzleSection).join("")}

<div class="datenav">
  <span>${nav.older ? `<a href="${miniPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>` : ""}</span>
  <span class="datenav-hint">Tip: Use <b>← / →</b> arrow keys to jump between days</span>
  <span>${nav.newer ? `<a href="${miniPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Mini Crossword Answers Today (${prettyDate(r.date)}) – Clues & Solutions`,
    `All clues, hints and answers for the daily Mini Crossword on ${prettyDate(r.date)}, with the ${esc(sizes)} solved grid.`,
    body,
    miniPath(r.date),
    false,
    CHROME,
  );
}

export function renderMiniArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map((d) => `<li data-date="${d}"><a href="${miniPath(d)}"><b>${esc(prettyDate(d))}</b><span class="date-tag">📅 ${d}</span></a></li>`)
        .join("")}</ul>`
    : `<p class="sub">No Mini Crossword puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Mini Crossword Answers Archive</h1>
  <p class="sub">${dates.length} past daily Mini Crosswords with clues and answers</p>
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

  return layout("Mini Crossword Answers Archive – Past Clues & Solutions", "Clues and answers for every past daily Mini Crossword.", body, `${MINI_CROSSWORD_HOME}/archive`, false, CHROME);
}

export function renderMiniNotFound(date?: string) {
  return layout(
    "Mini Crossword Not Found",
    "This Mini Crossword is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">✏️</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Mini Crossword results are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${MINI_CROSSWORD_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="${MINI_CROSSWORD_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    MINI_CROSSWORD_HOME,
    true,
    CHROME,
  );
}

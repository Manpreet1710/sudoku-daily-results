import { esc, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import type { QueensPuzzleResult, LinkedInQueensResult } from "./store.ts";

export const LINKEDIN_QUEENS_HOME = "/linkedin-queens";
export const linkedinQueensPath = (date: string) => `${LINKEDIN_QUEENS_HOME}/${date}`;
export const linkedinQueensSitemapPaths = (dates: string[]) => [
  LINKEDIN_QUEENS_HOME,
  `${LINKEDIN_QUEENS_HOME}/archive`,
  ...dates.map(linkedinQueensPath),
];

const CHROME: Chrome = {
  brand: "LinkedIn Queens Answers",
  brandHref: LINKEDIN_QUEENS_HOME,
  gameIcon: "👑",
  nav: [
    [LINKEDIN_QUEENS_HOME, "Today"],
    [`${LINKEDIN_QUEENS_HOME}/archive`, "Archive"],
  ],
  footer:
    "Hints and step-by-step solutions for the daily LinkedIn Queens puzzle, computed independently by our logic solver. Not affiliated with or endorsed by LinkedIn.",
  css: /* css */ `
.qboard-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: var(--shadow);
}
.qboard {
  width: min(440px, 100%);
  display: block;
  margin: 16px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
}
.qboard text {
  font-size: 26px;
  text-anchor: middle;
  dominant-baseline: central;
  fill: #0f172a;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin: 12px 0 16px;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--muted);
}
.legend li {
  display: inline-flex;
  align-items: center;
  background: var(--soft);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-weight: 600;
}
.legend i {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
.jump-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 24px;
}
.jump-pill {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}
.jump-pill:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  transform: translateY(-1px);
}
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
ol.qsteps {
  padding-left: 20px;
  margin-top: 14px;
  color: var(--ink-2);
}
ol.qsteps li {
  margin-bottom: 8px;
  line-height: 1.5;
}
`,
};

const PALETTE: Record<string, string> = {
  orange: "#fed7aa",
  blue: "#bfdbfe",
  purple: "#e9d5ff",
  green: "#bbf7d0",
  gray: "#e2e8f0",
  yellow: "#fef08a",
  red: "#fecaca",
  brown: "#fed7aa",
  pink: "#fbcfe8",
  gold: "#fde047",
  teal: "#99f6e4",
  lime: "#d9f99d",
};
const fill = (name: string, i: number) => PALETTE[name] ?? `hsl(${(i * 47) % 360} 65% 78%)`;

const LEVELS = ["", "Easy", "Medium", "Hard", "Expert"];

function boardSvg(p: QueensPuzzleResult) {
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
  const queens = p.queens
    .map(([r, c]) => `<text x="${c * u + u / 2}" y="${r * u + u / 2 + 1}">♛</text>`)
    .join("");
  const label = `${n} by ${n} Queens solution: ${p.queens
    .map(([r, c]) => `row ${r + 1} column ${c + 1}`)
    .join("; ")}`;

  return `<svg class="qboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img" aria-label="${esc(
    label
  )}">${rects}<path d="${thin}" stroke="#00000025" stroke-width="1" fill="none"/><path d="${thick}" stroke="#0f172a" stroke-width="3" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#0f172a" stroke-width="3.5" rx="6"/>${queens}</svg>`;
}

function puzzleSection(p: QueensPuzzleResult) {
  const id = `${p.size}x${p.size}`;
  const hints = p.steps
    .slice(0, 3)
    .map(
      (s, i) =>
        `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Deduction</summary><p style="margin-top:12px;font-size:15px">${esc(
          s.text
        )}</p></details>`
    )
    .join("");
  const smallest = Math.min(...p.colors.map((_, i) => p.grid.flat().filter((g) => g === i).length));
  const legend = `<ul class="legend">${p.colors
    .map((c, i) => `<li><i style="background:${fill(c, i)}"></i>${esc(c)}</li>`)
    .join("")}</ul>`;

  const coords = p.queens
    .map(([r, c]) => `<span class="coord-badge">Row ${r + 1}, Col ${c + 1}</span>`)
    .join(" ");

  return `
<section class="qboard-card" id="${id}">
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
    <h2 style="margin:0">👑 ${p.size}×${p.size} Queens Puzzle</h2>
    <span class="badge ${p.level >= 3 ? "warn" : "good"}">${LEVELS[p.level] || "Standard"}</span>
  </div>
  <p class="sub" style="margin-top:6px;font-size:13px">
    <span>${p.size} queens to place</span> · 
    <span>${p.colors.length} color regions</span> · 
    <span>Smallest region has ${smallest} cell${smallest === 1 ? "" : "s"}</span>
  </p>

  ${hints}

  <details>
    <summary style="color:var(--accent);font-weight:700">👑 Reveal ${p.size}×${p.size} Solution Board (Spoiler)</summary>
    <div style="margin-top:16px">
      ${boardSvg(p)}
      <div style="margin-top:12px">${legend}</div>
      <p style="margin-top:12px;font-size:14px"><b>Queen Coordinates:</b><br>${coords}</p>
      ${p.unique ? "" : '<p style="font-size:13px;color:var(--muted)">Note: Multiple valid solutions exist; this is one proven arrangement.</p>'}
    </div>
  </details>

  <details>
    <summary>Step-by-Step Logical Proof (${p.steps.length} steps)</summary>
    <ol class="qsteps">${p.steps.map((s) => `<li>${esc(s.text)}</li>`).join("")}</ol>
  </details>
</section>`;
}

export function renderLinkedInQueensResult(
  r: LinkedInQueensResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean
) {
  const sizes = r.puzzles.map((p) => `${p.size}×${p.size}`);
  const jump = r.puzzles
    .map((p) => `<a href="#${p.size}x${p.size}" class="jump-pill">Jump to ${p.size}×${p.size}</a>`)
    .join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}LinkedIn Queens Answers &amp; Solutions</h1>
  <div class="sub">
    <span>📅 ${esc(prettyDate(r.date))}</span>
    <span class="badge">LinkedIn Queens #${r.puzzleId}</span>
    <span class="badge good">${r.puzzles[0].size}×${r.puzzles[0].size} Grid</span>
  </div>
</div>

<p class="sub" style="font-size:15px; color:var(--ink-2); line-height:1.6">
  <b>Rules:</b> Place exactly one queen in every row, column, and color region, with no two queens touching (not even diagonally). Jump to any board size below:
</p>

<div class="jump-nav">${jump}</div>

${r.puzzles.map(puzzleSection).join("")}

<div class="datenav">
  <span>${
    nav.older
      ? `<a href="${linkedinQueensPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>`
      : ""
  }</span>
  <span class="datenav-hint">Tip: Use <b>← / →</b> arrow keys to jump between days</span>
  <span>${
    nav.newer
      ? `<a href="${linkedinQueensPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>`
      : ""
  }</span>
</div>`;

  return layout(
    `LinkedIn Queens Answers Today (${prettyDate(r.date)}) – Daily Solutions`,
    `Step-by-step logic, hints and verified queen coordinates for the ${sizes.join(
      ", "
    )} daily Queens puzzles on ${prettyDate(r.date)}.`,
    body,
    linkedinQueensPath(r.date),
    false,
    CHROME
  );
}

export function renderLinkedInQueensArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${linkedinQueensPath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No Queens puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>LinkedIn Queens Answers Archive</h1>
  <p class="sub">${dates.length} days of daily Queens puzzles and solutions</p>
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
        const text = li.textContent.toLowerCase();
        li.style.display = text.includes(q) ? "" : "none";
      });
    });
  }
})();
</script>`;

  return layout(
    "LinkedIn Queens Answers Archive – Past Daily Solutions",
    "Hints and step-by-step solutions for every past daily Queens puzzle.",
    body,
    `${LINKEDIN_QUEENS_HOME}/archive`,
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
        <a href="${LINKEDIN_QUEENS_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    LINKEDIN_QUEENS_HOME,
    true,
    CHROME
  );
}

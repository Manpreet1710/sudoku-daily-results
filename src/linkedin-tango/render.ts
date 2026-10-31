import { esc, gameBar, GM_REVEAL_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import type { LinkedInTangoResult } from "./store.ts";

export const LINKEDIN_TANGO_HOME = "/linkedin-tango";
export const linkedinTangoPath = (date: string) => `${LINKEDIN_TANGO_HOME}/${date}`;
export const linkedinTangoSitemapPaths = (dates: string[]) => [
  LINKEDIN_TANGO_HOME,
  `${LINKEDIN_TANGO_HOME}/archive`,
  ...dates.map(linkedinTangoPath),
];

const CHROME: Chrome = {
  brand: "LinkedIn Tango Answers",
  brandHref: LINKEDIN_TANGO_HOME,
  gameIcon: "☀️",
  nav: [
    [LINKEDIN_TANGO_HOME, "Today"],
    [`${LINKEDIN_TANGO_HOME}/archive`, "Archive"],
  ],
  footer:
    "Hints and step-by-step solutions for the daily LinkedIn Tango puzzle, computed independently by our logic solver. Not affiliated with or endorsed by LinkedIn.",
  css: /* css */ `
.tboard {
  width: min(390px, 100%);
  display: block;
  box-shadow: var(--shadow-lg);
}
.tboard .sign {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: central;
  fill: #334155;
}
.sol-row {
  display: inline-block;
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

const LEVELS = ["", "Easy", "Medium", "Hard"];

// Draws the 6x6 grid with sun/moon symbols and =/x constraint markers
function boardSvg(board: string, solution?: string) {
  const n = 6,
    u = 58,
    W = n * u,
    bg = "#fffbeb";

  const cell = (i: number, ch: string, solved: boolean) => {
    const cx = (i % n) * u + u / 2,
      cy = Math.floor(i / n) * u + u / 2;
    const op = solved ? ' opacity="0.85"' : "";

    return ch === "O"
      ? `<g${op}><circle cx="${cx}" cy="${cy}" r="17" fill="#f59e0b" stroke="#d97706" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="11" fill="#fde047" opacity="0.8"/></g>`
      : `<g${op}><circle cx="${cx}" cy="${cy}" r="17" fill="#4f46e5" stroke="#3730a3" stroke-width="2.5"/><circle cx="${cx + 8}" cy="${cy - 5}" r="14" fill="${bg}"/></g>`;
  };

  const symbols = [...board.slice(0, 36)]
    .map((ch, i) =>
      ch !== "." ? cell(i, ch, false) : solution ? cell(i, solution[i], true) : ""
    )
    .join("");

  const signs: string[] = [];
  for (let i = 0; i < 36; i++) {
    const r = Math.floor(i / n),
      c = i % n;
    for (const [m, x, y] of [
      [board[36 + i], (c + 1) * u, r * u + u / 2],
      [board[72 + i], c * u + u / 2, (r + 1) * u],
    ] as const) {
      if (m === ".") continue;
      signs.push(
        `<circle cx="${x}" cy="${y}" r="12" fill="${bg}" stroke="#cbd5e1" stroke-width="1.5"/><text class="sign" x="${x}" y="${
          y + 1
        }">${m === "=" ? "=" : "×"}</text>`
      );
    }
  }

  const lines = Array.from(
    { length: n - 1 },
    (_, k) => `M${(k + 1) * u} 0v${W}M0 ${(k + 1) * u}h${W}`
  ).join("");

  const label = solution
    ? `Solved Tango grid: ${[...solution]
        .map((ch) => (ch === "O" ? "sun" : "moon"))
        .join(", ")}`
    : "Tango grid with given symbols and constraint signs";

  return `<svg class="tboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img" aria-label="${esc(
    label
  )}"><rect x="0" y="0" width="${W}" height="${W}" fill="${bg}"/><path d="${lines}" stroke="#cbd5e1" stroke-width="1.5" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#0f172a" stroke-width="3.5" rx="8"/>${symbols}${signs.join(
    ""
  )}</svg>`;
}

const solutionRows = (solution: string) =>
  Array.from(
    { length: 6 },
    (_, r) =>
      `<span class="sol-row"><b>Row ${r + 1}:</b> ${[...solution.slice(r * 6, r * 6 + 6)]
        .map((ch) => (ch === "O" ? "☀️ Sun" : "🌙 Moon"))
        .join(" · ")}</span>`
  );

export function renderLinkedInTangoResult(
  r: LinkedInTangoResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean
) {
  const givens = [...r.board.slice(0, 36)].filter((ch) => ch !== ".").length;
  const signs = [...r.board.slice(36)].filter((ch) => ch !== ".").length;

  const hints = r.steps
    .slice(0, 3)
    .map(
      (s, i) =>
        `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Deduction</summary><p style="margin-top:12px;font-size:15px">${esc(
          s.text
        )}</p></details>`
    )
    .join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Tango Answers &amp; Solution</h1>
  <div class="sub">
    <span class="badge">${LEVELS[r.level]}</span>
    <span class="badge good">LinkedIn Tango #${r.puzzleId}</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer, path: linkedinTangoPath, archive: `${LINKEDIN_TANGO_HOME}/archive` })}
  <div class="gm-stage">
    <div class="gm-card">
      <p class="gm-meta"><span>6×6 · ${givens} given symbols · ${signs} signs</span><span>${LEVELS[r.level]}</span></p>
      <div class="gm-board" data-gm-view="puzzle">${boardSvg(r.board)}</div>
      <div class="gm-board" data-gm-view="solution" hidden>${boardSvg(r.board, r.solution)}</div>
    </div>
    <div>
      <p class="gm-help">Fill every row and column with <b>3 suns (☀️)</b> and <b>3 moons (🌙)</b>. No more than two of the same symbol can touch. <b>=</b> means identical symbols; <b>×</b> means opposite.</p>
      ${hints}
      <details>
        <summary>Step-by-Step Logic Timeline (${r.steps.length} steps)</summary>
        <ol class="steps" style="margin-top:14px">${r.steps
          .map(
            (s, i) =>
              `<li><span class="n">${i + 1}</span><div><span class="t">Step ${i + 1}</span><br><span style="color:var(--ink-2);font-size:14px">${esc(
                s.text
              )}</span></div></li>`
          )
          .join("")}</ol>
      </details>
      <div class="gm-actions">
        <button class="gm-btn primary" type="button" data-gm-reveal="Show full solution">Show full solution</button>
      </div>
      <div data-gm-solution-only hidden style="display:flex;flex-direction:column;gap:4px;margin-top:14px">${solutionRows(r.solution).join("")}
        ${r.unique ? "" : '<p style="font-size:13px;color:var(--muted);margin-top:10px">Note: This board has multiple valid answers; this is one verified solution.</p>'}
      </div>
    </div>
  </div>
</div>

<div class="datenav">
  <span>${
    nav.older
      ? `<a href="${linkedinTangoPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>`
      : ""
  }</span>
  <span>${
    nav.newer
      ? `<a href="${linkedinTangoPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>`
      : ""
  }</span>
</div>
${GM_REVEAL_SCRIPT}`;

  return layout(
    `Tango Answers Today (${prettyDate(r.date)}) – Daily Solution & Hints`,
    `Step-by-step logic, hints and the complete 6x6 solution for the daily Tango puzzle on ${prettyDate(
      r.date
    )}.`,
    body,
    linkedinTangoPath(r.date),
    false,
    CHROME
  );
}

export function renderLinkedInTangoArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${linkedinTangoPath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No Tango puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Tango Answers Archive</h1>
  <p class="sub">${dates.length} past daily Tango puzzles and solutions</p>
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
    "Tango Answers Archive – Past Daily Solutions",
    "Hints and step-by-step solutions for every past daily Tango puzzle.",
    body,
    `${LINKEDIN_TANGO_HOME}/archive`,
    false,
    CHROME
  );
}

export function renderLinkedInTangoNotFound(date?: string) {
  return layout(
    "Tango Puzzle Not Found",
    "This Tango puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">☀️</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Tango puzzles are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${LINKEDIN_TANGO_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="${LINKEDIN_TANGO_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    LINKEDIN_TANGO_HOME,
    true,
    CHROME
  );
}

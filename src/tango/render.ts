import { esc, layout, prettyDate, type Chrome } from "../render.ts";
import type { TangoResult } from "./store.ts";

export const TANGO_HOME = "/tango";
export const tangoPath = (date: string) => `${TANGO_HOME}/${date}`;
export const tangoSitemapPaths = (dates: string[]) => [TANGO_HOME, `${TANGO_HOME}/archive`, ...dates.map(tangoPath)];

const CHROME: Chrome = {
  brand: "Tango Answers",
  brandHref: TANGO_HOME,
  nav: [
    [TANGO_HOME, "Today"],
    [`${TANGO_HOME}/archive`, "Archive"],
    ["/wordle", "Wordle"],
    ["/connections", "Connections"],
    ["/spelling-bee", "Spelling Bee"],
    ["/queens", "Queens"],
    ["/zip", "Zip"],
    ["/", "Sudoku"],
  ],
  footer: "Hints and solutions for the daily Tango puzzle on tango-unlimited.com, computed by our own logic solver. Not affiliated with or endorsed by that site or LinkedIn.",
  css: /* css */ `
.tboard{width:min(380px,100%);display:block;margin:12px 0}
.tboard .sign{font-size:18px;font-weight:700;text-anchor:middle;dominant-baseline:central;fill:#5a4a3a}
details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:8px}
details summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0;color:var(--muted)}
.tsteps{margin:10px 0 0;padding-left:22px;color:var(--muted)}
.tsteps li{margin-bottom:6px}
`,
};

const LEVELS = ["", "Easy", "Medium", "Hard"];

// Draws the grid; with `solution`, empty cells show the answer in a lighter tone than the given symbols
function boardSvg(board: string, solution?: string) {
  const n = 6, u = 56, W = n * u, bg = "#fff8ec";
  const cell = (i: number, ch: string, solved: boolean) => {
    const cx = (i % n) * u + u / 2, cy = Math.floor(i / n) * u + u / 2;
    const op = solved ? ' opacity=".8"' : "";
    return ch === "O"
      ? `<circle cx="${cx}" cy="${cy}" r="16" fill="#f5a524" stroke="#b9770e" stroke-width="2"${op}/>`
      : `<g${op}><circle cx="${cx}" cy="${cy}" r="16" fill="#5b7fd6" stroke="#3a57a8" stroke-width="2"/><circle cx="${cx + 8}" cy="${cy - 5}" r="13" fill="${bg}"/></g>`;
  };
  const symbols = [...board.slice(0, 36)].map((ch, i) => (ch !== "." ? cell(i, ch, false) : solution ? cell(i, solution[i], true) : "")).join("");
  const signs: string[] = [];
  for (let i = 0; i < 36; i++) {
    const r = Math.floor(i / n), c = i % n;
    for (const [m, x, y] of [[board[36 + i], (c + 1) * u, r * u + u / 2], [board[72 + i], c * u + u / 2, (r + 1) * u]] as const) {
      if (m === ".") continue;
      signs.push(`<circle cx="${x}" cy="${y}" r="11" fill="${bg}" stroke="#d9c9b0"/><text class="sign" x="${x}" y="${y + 1}">${m === "=" ? "=" : "×"}</text>`);
    }
  }
  const lines = Array.from({ length: n - 1 }, (_, k) => `M${(k + 1) * u} 0v${W}M0 ${(k + 1) * u}h${W}`).join("");
  const label = solution
    ? `Solved Tango grid: ${[...solution].map((ch) => (ch === "O" ? "sun" : "moon")).join(", ")}`
    : "Tango grid with the given symbols and signs";
  return `<svg class="tboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img" aria-label="${esc(label)}"><rect x="0" y="0" width="${W}" height="${W}" fill="${bg}"/><path d="${lines}" stroke="#d9c9b0" stroke-width="1.5" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#5a4a3a" stroke-width="3"/>${symbols}${signs.join("")}</svg>`;
}

// Solution as text for crawlers and screen readers, one line per row
const solutionRows = (solution: string) =>
  Array.from({ length: 6 }, (_, r) => `Row ${r + 1}: ${[...solution.slice(r * 6, r * 6 + 6)].map((ch) => (ch === "O" ? "sun" : "moon")).join(", ")}`);

export function renderTangoResult(r: TangoResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const givens = [...r.board.slice(0, 36)].filter((ch) => ch !== ".").length;
  const signs = [...r.board.slice(36)].filter((ch) => ch !== ".").length;
  // Early deduction steps double as hints, mildest first; collapsed so nothing spoils until opened
  const hints = r.steps.slice(0, 3).map((s, i) => `<details><summary>Hint ${i + 1}</summary><p>${esc(s.text)}</p></details>`).join("");

  const body = `
<h1>${isHome ? "Today's " : ""}Tango Answers &amp; Solution</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">${LEVELS[r.level]}</span> · ${givens} symbols and ${signs} signs given</p>

<h2>${isHome ? "Today's grid" : "The grid"}</h2>
<p>Fill the grid with suns and moons: every row and column needs three of each, no more than two of the same symbol can touch, and each <b>=</b> sign means two cells match while each <b>×</b> sign means they differ.</p>
${boardSvg(r.board)}

<h2>Hints</h2>
<p class="sub">Open them one at a time, mildest first.</p>
${hints}

<h2>Solution</h2>
<details><summary>Show the solution (spoiler)</summary>
${boardSvg(r.board, r.solution)}
<p>${solutionRows(r.solution).map(esc).join("<br>")}</p>
${r.unique ? "" : "<p>Note: this board has more than one valid solution; this is one of them.</p>"}
</details>
<details><summary>Step-by-step logic (${r.steps.length} steps)</summary><ol class="tsteps">${r.steps.map((s) => `<li>${esc(s.text)}</li>`).join("")}</ol></details>

<div class="datenav">
  <span>${nav.older ? `<a href="${tangoPath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${tangoPath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Tango Answers Today (${prettyDate(r.date)}) – Daily Solution`,
    `Hints, step-by-step logic and the full solution for the daily Tango puzzle on ${prettyDate(r.date)}.`,
    body,
    tangoPath(r.date),
    false,
    CHROME,
  );
}

export function renderTangoArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${tangoPath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    "Tango Answers Archive – Past Daily Solutions",
    "Hints and solutions for every past daily Tango puzzle.",
    `<h1>Archive</h1><p class="sub">${dates.length} Tango puzzles solved</p>${list}`,
    `${TANGO_HOME}/archive`,
    false,
    CHROME,
  );
}

export function renderTangoNotFound(date?: string) {
  return layout(
    "Tango puzzle not found",
    "This Tango puzzle is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No puzzle for ${esc(date)} yet.` : "No puzzles have been crawled yet."} <a href="${TANGO_HOME}/archive">Browse the archive</a>.</p>`,
    TANGO_HOME,
    true,
    CHROME,
  );
}

import { esc, layout, prettyDate, type Chrome } from "../render.ts";
import type { QueensPuzzleResult, QueensResult } from "./store.ts";

export const QUEENS_HOME = "/queens";
export const queensPath = (date: string) => `${QUEENS_HOME}/${date}`;
export const queensSitemapPaths = (dates: string[]) => [QUEENS_HOME, `${QUEENS_HOME}/archive`, ...dates.map(queensPath)];

const CHROME: Chrome = {
  brand: "Queens Game Answers",
  brandHref: QUEENS_HOME,
  nav: [
    [QUEENS_HOME, "Today"],
    [`${QUEENS_HOME}/archive`, "Archive"],
    ["/wordle", "Wordle"],
    ["/connections", "Connections"],
    ["/spelling-bee", "Spelling Bee"],
    ["/tango", "Tango"],
    ["/zip", "Zip"],
    ["/", "Sudoku"],
  ],
  footer: "Hints and solutions for the daily Queens puzzles on playqueensgame.com, computed by our own logic solver. Not affiliated with or endorsed by that site.",
  css: /* css */ `
.qboard{width:min(440px,100%);display:block;margin:12px 0;border-radius:6px}
.qboard text{font-size:24px;text-anchor:middle;dominant-baseline:central;fill:#1d1d1b}
details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:8px}
details summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0;color:var(--muted)}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin:6px 0 0;padding:0;list-style:none;font-size:14px;color:var(--muted)}
.legend i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px;border:1px solid rgba(0,0,0,.25)}
.qsteps{margin:10px 0 0;padding-left:22px;color:var(--muted)}
.qsteps li{margin-bottom:6px}
.qsteps li b{color:var(--ink)}
`,
};

const PALETTE: Record<string, string> = {
  orange: "#ffc98b", blue: "#9ec5fe", purple: "#c9a7eb", green: "#a8d8a0", gray: "#cfcfcf", yellow: "#fff08a",
  red: "#f28b82", brown: "#c9a27c", pink: "#f9b8d4", gold: "#e6c84f", teal: "#7fd6cf", lime: "#d4ee8a",
};
const fill = (name: string, i: number) => PALETTE[name] ?? `hsl(${(i * 47) % 360} 65% 78%)`;

const LEVELS = ["", "Easy", "Medium", "Hard", "Expert"];

function boardSvg(p: QueensPuzzleResult) {
  const n = p.size, u = 40, W = n * u;
  const rects = p.grid.flatMap((row, r) => row.map((g, c) => `<rect x="${c * u}" y="${r * u}" width="${u}" height="${u}" fill="${fill(p.colors[g], g)}"/>`)).join("");
  // Thick lines only where two regions meet, thin grid elsewhere
  let thin = "", thick = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (c < n - 1) {
        const l = `M${(c + 1) * u} ${r * u}v${u}`;
        if (p.grid[r][c] === p.grid[r][c + 1]) thin += l; else thick += l;
      }
      if (r < n - 1) {
        const l = `M${c * u} ${(r + 1) * u}h${u}`;
        if (p.grid[r][c] === p.grid[r + 1][c]) thin += l; else thick += l;
      }
    }
  const queens = p.queens.map(([r, c]) => `<text x="${c * u + u / 2}" y="${r * u + u / 2 + 1}">♛</text>`).join("");
  const label = `${n} by ${n} Queens solution: ${p.queens.map(([r, c]) => `row ${r + 1} column ${c + 1}`).join("; ")}`;
  return `<svg class="qboard" viewBox="-2 -2 ${W + 4} ${W + 4}" role="img" aria-label="${esc(label)}">${rects}<path d="${thin}" stroke="#00000033" stroke-width="1" fill="none"/><path d="${thick}" stroke="#1d1d1b" stroke-width="3" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#1d1d1b" stroke-width="3"/>${queens}</svg>`;
}

function puzzleSection(p: QueensPuzzleResult) {
  const id = `${p.size}x${p.size}`;
  // Early deduction steps double as hints, mildest first; they are collapsed so nothing spoils until opened
  const hints = p.steps.slice(0, 3).map((s, i) => `<details><summary>Hint ${i + 1}</summary><p>${esc(s.text)}</p></details>`).join("");
  const smallest = Math.min(...p.colors.map((_, i) => p.grid.flat().filter((g) => g === i).length));
  const legend = `<ul class="legend">${p.colors.map((c, i) => `<li><i style="background:${fill(c, i)}"></i>${esc(c)}</li>`).join("")}</ul>`;
  return `
<h2 id="${id}">${p.size}×${p.size} Queens</h2>
<p class="sub"><span class="badge">${LEVELS[p.level]}</span> · ${p.size} queens, ${p.colors.length} color regions · smallest region has ${smallest} cell${smallest === 1 ? "" : "s"}</p>
${hints}
<details><summary>Show the solution (spoiler)</summary>
${boardSvg(p)}
${legend}
<p>Queen positions (row, column): ${p.queens.map(([r, c]) => `<b>${r + 1}, ${c + 1}</b>`).join(" · ")}</p>
${p.unique ? "" : "<p>Note: this board has more than one valid arrangement; this is one of them.</p>"}
</details>
<details><summary>Step-by-step logic (${p.steps.length} steps)</summary><ol class="qsteps">${p.steps.map((s) => `<li>${esc(s.text)}</li>`).join("")}</ol></details>`;
}

export function renderQueensResult(r: QueensResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const sizes = r.puzzles.map((p) => `${p.size}×${p.size}`);
  const jump = r.puzzles.map((p) => `<a href="#${p.size}x${p.size}">${p.size}×${p.size}</a>`).join(" · ");
  const body = `
<h1>${isHome ? "Today's " : ""}Queens Game Answers &amp; Solutions</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">Queens Daily</span> · Jump to ${jump}</p>
<p>Place one queen in every row, column and color region, with no two queens touching, not even diagonally. Open the hints one at a time, or reveal the full solution for each board.</p>
${r.puzzles.map(puzzleSection).join("")}

<div class="datenav">
  <span>${nav.older ? `<a href="${queensPath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${queensPath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Queens Game Answers Today (${prettyDate(r.date)}) – Daily Solutions`,
    `Hints, step-by-step logic and queen positions for the ${sizes.join(", ")} daily Queens puzzles on ${prettyDate(r.date)}.`,
    body,
    queensPath(r.date),
    false,
    CHROME,
  );
}

export function renderQueensArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${queensPath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    "Queens Game Answers Archive – Past Daily Solutions",
    "Hints and solutions for every past daily Queens puzzle.",
    `<h1>Archive</h1><p class="sub">${dates.length} days of Queens puzzles</p>${list}`,
    `${QUEENS_HOME}/archive`,
    false,
    CHROME,
  );
}

export function renderQueensNotFound(date?: string) {
  return layout(
    "Queens puzzle not found",
    "This Queens puzzle is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No puzzle for ${esc(date)} yet.` : "No puzzles have been crawled yet."} <a href="${QUEENS_HOME}/archive">Browse the archive</a>.</p>`,
    QUEENS_HOME,
    true,
    CHROME,
  );
}

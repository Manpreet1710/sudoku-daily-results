import { esc, layout, prettyDate, type Chrome } from "../render.ts";
import type { ZipResult } from "./store.ts";

export const ZIP_HOME = "/zip";
export const zipPath = (date: string) => `${ZIP_HOME}/${date}`;
export const zipSitemapPaths = (dates: string[]) => [ZIP_HOME, `${ZIP_HOME}/archive`, ...dates.map(zipPath)];

const CHROME: Chrome = {
  brand: "Zip Answers",
  brandHref: ZIP_HOME,
  nav: [
    [ZIP_HOME, "Today"],
    [`${ZIP_HOME}/archive`, "Archive"],
    ["/wordle", "Wordle"],
    ["/connections", "Connections"],
    ["/spelling-bee", "Spelling Bee"],
    ["/queens", "Queens"],
    ["/tango", "Tango"],
    ["/", "Sudoku"],
  ],
  footer: "Hints and solutions for the daily Zip puzzle on zipgameunlimited.com, computed by our own logic solver. Not affiliated with or endorsed by that site or LinkedIn.",
  css: /* css */ `
.zboard{width:min(420px,100%);display:block;margin:12px 0}
.zboard text{font-size:19px;font-weight:700;text-anchor:middle;dominant-baseline:central;fill:#fff}
details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:8px}
details summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0;color:var(--muted)}
.zsteps{margin:10px 0 0;padding-left:22px;color:var(--muted)}
.zsteps li{margin-bottom:6px}
`,
};

const LEVELS = { medium: "Medium", hard: "Hard" } as const;

// Draws the grid with walls and checkpoints; with `path`, also the route through every cell
function boardSvg(r: ZipResult, withPath: boolean) {
  const n = r.size, u = 56, W = n * u, bg = "#fff8ec";
  const centre = ([row, col]: [number, number]) => `${col * u + u / 2},${row * u + u / 2}`;
  const grid = Array.from({ length: n - 1 }, (_, k) => `M${(k + 1) * u} 0v${W}M0 ${(k + 1) * u}h${W}`).join("");
  const walls = r.walls
    .map((w) => {
      const [kind, row, col] = w.split("_");
      const rr = Number(row), cc = Number(col);
      return kind === "V" ? `M${(cc + 1) * u} ${rr * u}v${u}` : `M${cc * u} ${(rr + 1) * u}h${u}`;
    })
    .join("");
  const route = withPath ? `<polyline points="${r.path.map(centre).join(" ")}" fill="none" stroke="#e8833a" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>` : "";
  const nums = r.numbers
    .map(([row, col, k]) => `<circle cx="${col * u + u / 2}" cy="${row * u + u / 2}" r="17" fill="#3b2f27"/><text x="${col * u + u / 2}" y="${row * u + u / 2 + 1}">${k}</text>`)
    .join("");
  const label = withPath
    ? `Solved Zip grid: the path visits ${r.numbers.length} numbered checkpoints in order and fills all ${n * n} cells`
    : `Zip grid, ${n} by ${n}, with ${r.numbers.length} numbered checkpoints and ${r.walls.length} walls`;
  return `<svg class="zboard" viewBox="-3 -3 ${W + 6} ${W + 6}" role="img" aria-label="${esc(label)}"><rect x="0" y="0" width="${W}" height="${W}" fill="${bg}"/><path d="${grid}" stroke="#d9c9b0" stroke-width="1.5" fill="none"/>${route}<path d="${walls}" stroke="#3b2f27" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#3b2f27" stroke-width="5"/>${nums}</svg>`;
}

const where = (n: number, [row, col]: [number, number]) => `row ${row + 1}, column ${col + 1}`;

// "right 2, down 1": the moves between two cells of the path, runs of the same direction merged
function moves(cells: [number, number][]) {
  const out: [string, number][] = [];
  for (let i = 1; i < cells.length; i++) {
    const dr = cells[i][0] - cells[i - 1][0], dc = cells[i][1] - cells[i - 1][1];
    const dir = dr === 1 ? "down" : dr === -1 ? "up" : dc === 1 ? "right" : "left";
    if (out.at(-1)?.[0] === dir) out.at(-1)![1]++;
    else out.push([dir, 1]);
  }
  return out.map(([d, k]) => `${d} ${k}`).join(", ");
}

// One entry per checkpoint pair, e.g. "1 → 2: right 2, down 1"
function routes(r: ZipResult) {
  const at = new Map(r.path.map((p, i) => [`${p[0]}-${p[1]}`, i]));
  const order = [...r.numbers].sort((a, b) => a[2] - b[2]);
  return order.slice(1).map((cur, k) => {
    const from = at.get(`${order[k][0]}-${order[k][1]}`)!, to = at.get(`${cur[0]}-${cur[1]}`)!;
    return { from: order[k][2], to: cur[2], text: moves(r.path.slice(from, to + 1)) };
  });
}

export function renderZipResult(r: ZipResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const order = [...r.numbers].sort((a, b) => a[2] - b[2]);
  const first = order[0], last = order.at(-1)!;
  const route = routes(r);
  const hints = [
    `The path starts at the 1 in ${where(r.size, [first[0], first[1]])} and ends at the ${last[2]} in ${where(r.size, [last[0], last[1]])}. It must cover all ${r.size * r.size} cells.`,
    r.steps[0]?.text,
    `The first stretch, from 1 to 2, goes: ${route[0].text}.`,
  ].filter(Boolean) as string[];

  const body = `
<h1>${isHome ? "Today's " : ""}Zip Answers &amp; Solution</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">${LEVELS[r.difficulty]}</span> · ${r.size}×${r.size} grid, ${r.numbers.length} checkpoints, ${r.walls.length} walls</p>

<h2>${isHome ? "Today's grid" : "The grid"}</h2>
<p>Draw one path that starts at 1, passes the numbers in order, fills every cell exactly once, and never crosses a thick wall.</p>
${boardSvg(r, false)}

<h2>Hints</h2>
<p class="sub">Open them one at a time, mildest first.</p>
${hints.map((h, i) => `<details><summary>Hint ${i + 1}</summary><p>${esc(h)}</p></details>`).join("")}

<h2>Solution</h2>
<details><summary>Show the solution (spoiler)</summary>
${boardSvg(r, true)}
<p>${route.map((s) => `<b>${s.from} → ${s.to}:</b> ${esc(s.text)}`).join("<br>")}</p>
${r.unique ? "" : "<p>Note: this board has more than one valid path; this is one of them.</p>"}
</details>
<details><summary>Step-by-step logic (${r.steps.length} steps)</summary><ol class="zsteps">${r.steps.map((s) => `<li>${esc(s.text)}</li>`).join("")}</ol>${r.logical ? "" : "<p>The last stretch could not be fully explained by these rules alone.</p>"}</details>

<div class="datenav">
  <span>${nav.older ? `<a href="${zipPath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${zipPath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Zip Answers Today (${prettyDate(r.date)}) – Daily Solution`,
    `Hints, route and full solution for the daily ${r.size}×${r.size} Zip puzzle on ${prettyDate(r.date)}.`,
    body,
    zipPath(r.date),
    false,
    CHROME,
  );
}

export function renderZipArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${zipPath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    "Zip Answers Archive – Past Daily Solutions",
    "Hints and solutions for every past daily Zip puzzle.",
    `<h1>Archive</h1><p class="sub">${dates.length} Zip puzzles solved</p>${list}`,
    `${ZIP_HOME}/archive`,
    false,
    CHROME,
  );
}

export function renderZipNotFound(date?: string) {
  return layout(
    "Zip puzzle not found",
    "This Zip puzzle is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No puzzle for ${esc(date)} yet.` : "No puzzles have been crawled yet."} <a href="${ZIP_HOME}/archive">Browse the archive</a>.</p>`,
    ZIP_HOME,
    true,
    CHROME,
  );
}

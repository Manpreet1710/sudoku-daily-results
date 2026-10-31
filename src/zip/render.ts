import { esc, gameBar, GM_REVEAL_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import type { ZipResult } from "./store.ts";

export const ZIP_HOME = "/zip-unlimited";
export const zipPath = (date: string) => `${ZIP_HOME}/${date}`;
export const zipSitemapPaths = (dates: string[]) => [
  ZIP_HOME,
  `${ZIP_HOME}/archive`,
  ...dates.map(zipPath),
];

const CHROME: Chrome = {
  brand: "Zip Answers",
  brandHref: ZIP_HOME,
  gameIcon: "⚡",
  nav: [
    [ZIP_HOME, "Today"],
    [`${ZIP_HOME}/archive`, "Archive"],
  ],
  footer:
    "Hints and step-by-step route solutions for daily Zip puzzles on zipgameunlimited.com, computed independently by our logic solver. Not affiliated with or endorsed by LinkedIn or zipgameunlimited.com.",
  css: /* css */ `
.zboard {
  width: min(420px, 100%);
  display: block;
  box-shadow: var(--shadow-lg);
}
.zboard text {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: central;
  fill: #ffffff;
}
.route-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.route-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  font-size: 14px;
}
.route-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--accent-gradient);
  color: #ffffff;
  font-weight: 800;
  font-size: 12px;
  flex: none;
}
`,
};

const LEVELS = { medium: "Medium", hard: "Hard" } as const;

function boardSvg(r: ZipResult, withPath: boolean) {
  const n = r.size,
    u = 58,
    W = n * u,
    bg = "#fdfbf7";
  const centre = ([row, col]: [number, number]) => `${col * u + u / 2},${row * u + u / 2}`;
  const grid = Array.from(
    { length: n - 1 },
    (_, k) => `M${(k + 1) * u} 0v${W}M0 ${(k + 1) * u}h${W}`
  ).join("");

  const walls = r.walls
    .map((w) => {
      const [kind, row, col] = w.split("_");
      const rr = Number(row),
        cc = Number(col);
      return kind === "V"
        ? `M${(cc + 1) * u} ${rr * u}v${u}`
        : `M${cc * u} ${(rr + 1) * u}h${u}`;
    })
    .join("");

  const route = withPath
    ? `<polyline points="${r.path
        .map(centre)
        .join(
          " "
        )}" fill="none" stroke="#f97316" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" style="filter:drop-shadow(0 0 6px rgba(249,115,22,0.6))"/>`
    : "";

  const nums = r.numbers
    .map(
      ([row, col, k]) =>
        `<circle cx="${col * u + u / 2}" cy="${
          row * u + u / 2
        }" r="18" fill="#0f172a" stroke="#ffffff" stroke-width="2"/><text x="${
          col * u + u / 2
        }" y="${row * u + u / 2 + 1}">${k}</text>`
    )
    .join("");

  const label = withPath
    ? `Solved Zip grid: path visits ${r.numbers.length} numbered checkpoints and fills all ${n * n} cells`
    : `Zip grid ${n}x${n} with ${r.numbers.length} numbered checkpoints and ${r.walls.length} barriers`;

  return `<svg class="zboard" viewBox="-3 -3 ${W + 6} ${W + 6}" role="img" aria-label="${esc(
    label
  )}"><rect x="0" y="0" width="${W}" height="${W}" fill="${bg}"/><path d="${grid}" stroke="#e2e8f0" stroke-width="1.5" fill="none"/>${route}<path d="${walls}" stroke="#0f172a" stroke-width="6" stroke-linecap="round" fill="none"/><rect x="0" y="0" width="${W}" height="${W}" fill="none" stroke="#0f172a" stroke-width="4" rx="8"/>${nums}</svg>`;
}

const where = (n: number, [row, col]: [number, number]) => `Row ${row + 1}, Col ${col + 1}`;

function moves(cells: [number, number][]) {
  const out: [string, number][] = [];
  for (let i = 1; i < cells.length; i++) {
    const dr = cells[i][0] - cells[i - 1][0],
      dc = cells[i][1] - cells[i - 1][1];
    const dir = dr === 1 ? "down ⬇️" : dr === -1 ? "up ⬆️" : dc === 1 ? "right ➡️" : "left ⬅️";
    if (out.at(-1)?.[0] === dir) out.at(-1)![1]++;
    else out.push([dir, 1]);
  }
  return out.map(([d, k]) => `${k} step${k > 1 ? "s" : ""} ${d}`).join(", ");
}

function routes(r: ZipResult) {
  const at = new Map(r.path.map((p, i) => [`${p[0]}-${p[1]}`, i]));
  const order = [...r.numbers].sort((a, b) => a[2] - b[2]);
  return order.slice(1).map((cur, k) => {
    const from = at.get(`${order[k][0]}-${order[k][1]}`)!,
      to = at.get(`${cur[0]}-${cur[1]}`)!;
    return {
      from: order[k][2],
      to: cur[2],
      text: moves(r.path.slice(from, to + 1)),
    };
  });
}

export function renderZipResult(
  r: ZipResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean
) {
  const order = [...r.numbers].sort((a, b) => a[2] - b[2]);
  const first = order[0],
    last = order.at(-1)!;
  const route = routes(r);

  const hints = [
    `The path begins at checkpoint 1 in ${where(r.size, [first[0], first[1]])} and finishes at ${
      last[2]
    } in ${where(r.size, [last[0], last[1]])}. It must fill every one of the ${r.size * r.size} cells.`,
    r.steps[0]?.text,
    `The initial stretch (1 ➔ 2): goes ${route[0]?.text}.`,
  ].filter(Boolean) as string[];

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Zip Answers &amp; Solution</h1>
  <div class="sub">
    <span class="badge">${LEVELS[r.difficulty] || "Normal"}</span>
    <span class="badge good">Zip Daily</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer, path: zipPath, archive: `${ZIP_HOME}/archive` })}
  <div class="gm-stage">
    <div class="gm-card">
      <p class="gm-meta"><span>${r.size}×${r.size} · ${r.numbers.length} checkpoints · ${r.walls.length} walls</span><span>${LEVELS[r.difficulty] || "Normal"}</span></p>
      <div class="gm-board" data-gm-view="puzzle">${boardSvg(r, false)}</div>
      <div class="gm-board" data-gm-view="solution" hidden>${boardSvg(r, true)}</div>
    </div>
    <div>
      <p class="gm-help">Draw <b>one continuous line</b> from 1, through each numbered checkpoint in order, filling every cell exactly once without crossing a thick wall.</p>
      ${hints
        .map(
          (h, i) =>
            `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Clue</summary><p style="margin-top:12px;font-size:15px">${esc(
              h
            )}</p></details>`
        )
        .join("")}
      <details>
        <summary>Step-by-Step Logic Proof (${r.steps.length} steps)</summary>
        <ol class="steps" style="margin-top:14px">${r.steps
          .map(
            (s, i) =>
              `<li><span class="n">${i + 1}</span><div><span class="t">Step ${i + 1}</span><br><span style="color:var(--ink-2);font-size:14px">${esc(
                s.text
              )}</span></div></li>`
          )
          .join("")}</ol>
        ${r.logical ? "" : '<p style="font-size:13px;color:var(--muted);margin-top:8px">The remaining stretch was validated by exhaustive branch verification.</p>'}
      </details>
      <div class="gm-actions">
        <button class="gm-btn primary" type="button" data-gm-reveal="Show full solution">Show full solution</button>
      </div>
      <div data-gm-solution-only hidden>
        <div class="route-list">
          ${route
            .map(
              (s) =>
                `<div class="route-item"><span class="route-node">${s.from} ➔ ${s.to}</span><span>${esc(
                  s.text
                )}</span></div>`
            )
            .join("")}
        </div>
        ${r.unique ? "" : '<p style="font-size:13px;color:var(--muted);margin-top:12px">Note: Multiple valid paths exist; this is one verified solution.</p>'}
      </div>
    </div>
  </div>
</div>

<div class="datenav">
  <span>${
    nav.older
      ? `<a href="${zipPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>`
      : ""
  }</span>
  <span>${
    nav.newer
      ? `<a href="${zipPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>`
      : ""
  }</span>
</div>
${GM_REVEAL_SCRIPT}`;

  return layout(
    `Zip Answers Today (${prettyDate(r.date)}) – Daily Solution & Hints`,
    `Step-by-step logic, waypoints and the full solution for the daily ${r.size}×${r.size} Zip puzzle on ${prettyDate(
      r.date
    )}.`,
    body,
    zipPath(r.date),
    false,
    CHROME
  );
}

export function renderZipArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${zipPath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No Zip puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Zip Answers Archive</h1>
  <p class="sub">${dates.length} past daily Zip puzzles and solutions</p>
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
    "Zip Answers Archive – Past Daily Solutions",
    "Hints and route solutions for every past daily Zip puzzle.",
    body,
    `${ZIP_HOME}/archive`,
    false,
    CHROME
  );
}

export function renderZipNotFound(date?: string) {
  return layout(
    "Zip Puzzle Not Found",
    "This Zip puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">⚡</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Zip puzzles are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${ZIP_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="${ZIP_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    ZIP_HOME,
    true,
    CHROME
  );
}

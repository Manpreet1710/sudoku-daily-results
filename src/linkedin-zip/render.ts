import { esc, dateNav, gameBar, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { historyBoard, historyBoards, historyDate, renderHistory } from "../history.ts";
import type { LinkedInZipResult } from "./store.ts";

export const LINKEDIN_ZIP_HOME = "/linkedin-zip-answer-today";
export const LINKEDIN_ZIP_YESTERDAY = "/linkedin-zip-answer-yesterday";
export const linkedinZipPath = (isHome: boolean) => (isHome ? LINKEDIN_ZIP_HOME : LINKEDIN_ZIP_YESTERDAY);
export const linkedinZipSitemapPaths = () => [LINKEDIN_ZIP_HOME, LINKEDIN_ZIP_YESTERDAY];

const CHROME: Chrome = {
  brand: "LinkedIn Zip Answers",
  brandHref: LINKEDIN_ZIP_HOME,
  gameIcon: "⚡",
  nav: [
    [LINKEDIN_ZIP_HOME, "Today"],
    [LINKEDIN_ZIP_YESTERDAY, "Yesterday"],
  ],
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
.zplay-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 14px; }
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

function boardSvg(r: LinkedInZipResult, withPath: boolean) {
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

function routes(r: LinkedInZipResult) {
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

// Reveal all swaps in the solved board and the route list; Clear all swaps them back
const ZIP_PLAY_SCRIPT = `<script>
(() => {
  document.querySelectorAll(".gm-stage").forEach((stage) => {
    const all = stage.querySelector("[data-z-all]");
    if (!all) return;
    const puzzle = stage.querySelector('[data-gm-view="puzzle"]');
    const solved = stage.querySelector('[data-gm-view="solution"]');
    const extra = stage.querySelectorAll("[data-gm-solution-only]");
    const show = (on) => {
      puzzle.hidden = on;
      solved.hidden = !on;
      extra.forEach((e) => { e.hidden = !on; });
    };
    all.addEventListener("click", () => show(true));
    stage.querySelector("[data-z-clear]").addEventListener("click", () => show(false));
  });
})();
</script>`;

function linkedInZipHistory(past: LinkedInZipResult[]) {
  return renderHistory({
    title: "LinkedIn Zip Solutions History",
    intro: "Every past LinkedIn Zip puzzle, month by month.",
    entries: past.map((r) => ({
      date: r.date,
      heading: `${historyDate(r.date)}`,
      body: historyBoards([historyBoard(boardSvg(r, true), `Zip #${r.puzzleId}`)]),
    })),
  });
}

export function renderLinkedInZipResult(
  r: LinkedInZipResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean, past: LinkedInZipResult[] = []) {
  const route = routes(r);

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}Zip Answers &amp; Solution</h1>
  <div class="sub">
    <span class="badge good">Puzzle #${r.puzzleId}</span>
    <span class="badge">${r.size}×${r.size}</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer })}
  <div class="gm-stage">
    <div class="gm-card">
      <div class="gm-board" data-gm-view="puzzle">${boardSvg(r, false)}</div>
      <div class="gm-board" data-gm-view="solution" hidden>${boardSvg(r, true)}</div>
      <div class="zplay-actions">
        <button type="button" class="gm-btn primary" data-z-all>Reveal all</button>
        <button type="button" class="gm-btn" data-z-clear>Clear all</button>
      </div>
    </div>
    <div>
      <p class="gm-help">Draw <b>one continuous line</b> from 1, through each numbered checkpoint in order, filling every cell exactly once without crossing a thick wall.</p>
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

${dateNav(nav)}
${isHome ? linkedInZipHistory(past) : ""}
${ZIP_PLAY_SCRIPT}`;

  return layout(
    `Zip Answers ${isHome ? "Today" : "Yesterday"} (${prettyDate(r.date)}) – Daily Solution & Hints`,
    `Step-by-step logic, waypoints and the full solution for the daily ${r.size}×${r.size} Zip puzzle on ${prettyDate(
      r.date
    )}.`,
    body,
    linkedinZipPath(isHome),
    false,
    CHROME
  );
}

export function renderLinkedInZipNotFound(date?: string) {
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
        <a href="${LINKEDIN_ZIP_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
      </div>
    </div>`,
    LINKEDIN_ZIP_HOME,
    true,
    CHROME
  );
}

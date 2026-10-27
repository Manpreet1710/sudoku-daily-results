import { esc, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { spellingBeeFacts, spellingBeeHints } from "./hints.ts";
import type { SpellingBeeResult } from "./store.ts";

export const SPELLING_BEE_HOME = "/spelling-bee";
export const spellingBeePath = (date: string) => `${SPELLING_BEE_HOME}/${date}`;
export const spellingBeeSitemapPaths = (dates: string[]) => [
  SPELLING_BEE_HOME,
  `${SPELLING_BEE_HOME}/archive`,
  ...dates.map(spellingBeePath),
];

const CHROME: Chrome = {
  brand: "Spelling Bee Answers",
  brandHref: SPELLING_BEE_HOME,
  gameIcon: "🐝",
  nav: [
    [SPELLING_BEE_HOME, "Today"],
    [`${SPELLING_BEE_HOME}/archive`, "Archive"],
  ],
  footer:
    "Daily hints and solutions for the New York Times Spelling Bee. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.hive-wrap {
  display: flex;
  justify-content: center;
  margin: 16px 0 28px;
}
.hive {
  width: min(280px, 75vw);
  display: block;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.08));
}
.hive polygon {
  fill: #f1f5f9;
  stroke: #cbd5e1;
  stroke-width: 2.5;
  transition: transform 0.2s ease, fill 0.2s ease;
  cursor: default;
}
.hive polygon:hover {
  fill: #e2e8f0;
}
.hive polygon.c {
  fill: #f59e0b;
  stroke: #d97706;
  filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));
}
.hive text {
  font-family: var(--font-sans);
  font-size: 27px;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: central;
  fill: var(--ink);
  text-transform: uppercase;
  user-select: none;
  pointer-events: none;
}
.hive text.c-text {
  fill: #000000;
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
  font-weight: 600;
  color: var(--ink);
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease;
}
.gw span:hover {
  transform: translateY(-1px);
}
.gw span.pg {
  background: linear-gradient(135deg, #fef08a 0%, #fde047 100%);
  border-color: #eab308;
  color: #713f12;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.35);
}
[data-theme="dark"] .gw span.pg {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.4) 100%);
  border-color: #eab308;
  color: #fef08a;
}
`,
};

// Flat-top hexagon centered at (cx, cy)
const hex = (cx: number, cy: number, r: number) =>
  [0, 1, 2, 3, 4, 5]
    .map((i) => `${(cx + r * Math.cos((Math.PI / 3) * i)).toFixed(1)},${(cy + r * Math.sin((Math.PI / 3) * i)).toFixed(1)}`)
    .join(" ");

function honeycomb(center: string, outer: string[]) {
  const r = 36,
    gap = 4,
    d = (r + gap) * Math.sqrt(3);
  const cell = (x: number, y: number, ch: string, isCenter = false) =>
    `<g><polygon class="${isCenter ? "c" : ""}" points="${hex(x, y, r)}"/><text class="${
      isCenter ? "c-text" : ""
    }" x="${x}" y="${y}">${esc(ch)}</text></g>`;

  const ring = outer.map((ch, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return cell(130 + d * Math.cos(a), 130 + d * Math.sin(a), ch);
  });

  return `<div class="hive-wrap"><svg class="hive" viewBox="0 0 260 260" role="img" aria-label="Center letter: ${esc(
    center.toUpperCase()
  )}, outer letters: ${esc(outer.join(", ").toUpperCase())}">${ring.join("")}${cell(
    130,
    130,
    center,
    true
  )}</svg></div>`;
}

export function renderSpellingBeeResult(
  r: SpellingBeeResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean
) {
  const facts = spellingBeeFacts(r.answers, r.pangrams);
  const hints = spellingBeeHints(r.answers, r.pangrams)
    .map(
      (h, i) =>
        `<details><summary><span class="badge" style="margin-right:6px">Hint ${i + 1}</span> Clue</summary><p style="margin-top:12px;font-size:15px">${esc(
          h
        )}</p></details>`
    )
    .join("");
  const pg = new Set(r.pangrams);
  const words = [...r.answers]
    .sort()
    .map((w) => `<span${pg.has(w) ? ' class="pg"' : ""}>${esc(w)}</span>`)
    .join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Spelling Bee Hints &amp; Answers</h1>
  <div class="sub">
    <span>📅 ${esc(prettyDate(r.date))}</span>
    <span class="badge">NYT Spelling Bee</span>
    <span class="badge good">${facts.count} Words</span>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="k">Total Words</div><div class="v">${facts.count}</div></div>
  <div class="stat"><div class="k">Pangrams</div><div class="v" style="color:var(--warning)">👑 ${facts.pangrams}</div></div>
  <div class="stat"><div class="k">Center Letter</div><div class="v" style="color:var(--accent)">${esc(r.center.toUpperCase())}</div></div>
  <div class="stat"><div class="k">Min Length</div><div class="v">4+ letters</div></div>
</div>

<h2>Today's Honeycomb</h2>
<p class="sub" style="font-size:14px; margin-bottom:12px">All words must include the glowing center letter <b>${esc(
    r.center.toUpperCase()
  )}</b>.</p>
${honeycomb(r.center, r.outer)}

<h2>Progressive Hints</h2>
<p class="sub" style="font-size:14px; margin-bottom:12px">Uncover clues one by one without spoiling the answers.</p>
${hints}

<h2>Answers &amp; Solutions</h2>
<details>
  <summary style="color:var(--warning);font-weight:700">👑 Reveal Pangram${r.pangrams.length === 1 ? "" : "s"} (Uses all 7 letters)</summary>
  <div class="gw">${r.pangrams.map((w) => `<span class="pg">👑 ${esc(w)}</span>`).join("")}</div>
</details>

<details>
  <summary>Reveal All ${facts.count} Words (Full Word List)</summary>
  <div class="gw">${words}</div>
</details>

<div class="datenav">
  <span>${
    nav.older
      ? `<a href="${spellingBeePath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>`
      : ""
  }</span>
  <span class="datenav-hint">Tip: Use <b>← / →</b> arrow keys to jump between days</span>
  <span>${
    nav.newer
      ? `<a href="${spellingBeePath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>`
      : ""
  }</span>
</div>`;

  return layout(
    `Spelling Bee Hints & Answers Today (${prettyDate(r.date)}) – NYT Puzzle`,
    `Today's letters honeycomb, hints and all ${facts.count} answers (including pangrams) for NYT Spelling Bee on ${prettyDate(
      r.date
    )}. Progressive hints first, then reveal the full word list.`,
    body,
    spellingBeePath(r.date),
    false,
    CHROME
  );
}

export function renderSpellingBeeArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${spellingBeePath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No Spelling Bee puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Spelling Bee Answers Archive</h1>
  <p class="sub">${dates.length} past NYT Spelling Bee puzzles and solutions</p>
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
    "Spelling Bee Answers Archive – Past Hints & Solutions",
    "Hints and answers for every past NYT Spelling Bee puzzle.",
    body,
    `${SPELLING_BEE_HOME}/archive`,
    false,
    CHROME
  );
}

export function renderSpellingBeeNotFound(date?: string) {
  return layout(
    "Spelling Bee Puzzle Not Found",
    "This Spelling Bee puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🐝</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Spelling Bee results are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${SPELLING_BEE_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="${SPELLING_BEE_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    SPELLING_BEE_HOME,
    true,
    CHROME
  );
}

import { esc, layout, prettyDate, type Chrome } from "../render.ts";
import { spellingBeeFacts, spellingBeeHints } from "./hints.ts";
import type { SpellingBeeResult } from "./store.ts";

export const SPELLING_BEE_HOME = "/spelling-bee";
export const spellingBeePath = (date: string) => `${SPELLING_BEE_HOME}/${date}`;
export const spellingBeeSitemapPaths = (dates: string[]) => [SPELLING_BEE_HOME, `${SPELLING_BEE_HOME}/archive`, ...dates.map(spellingBeePath)];

const CHROME: Chrome = {
  brand: "Spelling Bee Answers",
  brandHref: SPELLING_BEE_HOME,
  nav: [
    [SPELLING_BEE_HOME, "Today"],
    [`${SPELLING_BEE_HOME}/archive`, "Archive"],
    ["/wordle", "Wordle"],
    ["/connections", "Connections"],
    ["/queens", "Queens"],
    ["/tango", "Tango"],
    ["/zip", "Zip"],
    ["/", "Sudoku"],
  ],
  footer: "Hints and answers for the New York Times Spelling Bee. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.hive{width:min(260px,70vw);display:block;margin:12px 0}
.hive polygon{fill:var(--accent-soft)}
.hive polygon.c{fill:#f7da21}
.hive text{font-size:26px;font-weight:700;text-anchor:middle;dominant-baseline:central;fill:var(--ink);text-transform:uppercase}
details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:8px}
details summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0;color:var(--muted)}
.gw{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.gw span{padding:6px 12px;border-radius:8px;background:var(--accent-soft);font-weight:600}
.gw span.pg{background:#f7da21;color:#1d1d1b;font-weight:700}
`,
};

// Flat-top hexagon centered at (cx, cy)
const hex = (cx: number, cy: number, r: number) =>
  [0, 1, 2, 3, 4, 5].map((i) => `${(cx + r * Math.cos((Math.PI / 3) * i)).toFixed(1)},${(cy + r * Math.sin((Math.PI / 3) * i)).toFixed(1)}`).join(" ");

function honeycomb(center: string, outer: string[]) {
  const r = 34, gap = 4, d = (r + gap) * Math.sqrt(3);
  const cell = (x: number, y: number, ch: string, cls = "") => `<polygon class="${cls}" points="${hex(x, y, r)}"/><text x="${x}" y="${y}">${esc(ch)}</text>`;
  const ring = outer.map((ch, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return cell(130 + d * Math.cos(a), 130 + d * Math.sin(a), ch);
  });
  return `<svg class="hive" viewBox="0 0 260 260" role="img" aria-label="Letters: ${esc(center.toUpperCase())} in the center, ${esc(outer.join(", ").toUpperCase())} around it">${ring.join("")}${cell(130, 130, center, "c")}</svg>`;
}

export function renderSpellingBeeResult(r: SpellingBeeResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const facts = spellingBeeFacts(r.answers, r.pangrams);
  const hints = spellingBeeHints(r.answers, r.pangrams)
    .map((h, i) => `<details><summary>Hint ${i + 1}</summary><p>${esc(h)}</p></details>`)
    .join("");
  const pg = new Set(r.pangrams);
  const words = [...r.answers].sort().map((w) => `<span${pg.has(w) ? ' class="pg"' : ""}>${esc(w)}</span>`).join("");

  // Hints and answers are in the HTML (crawlable) but collapsed, so nothing spoils until opened
  const body = `
<h1>${isHome ? "Today's " : ""}Spelling Bee Hints &amp; Answers</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">NYT Spelling Bee</span></p>

<h2>Today's letters</h2>
<p class="sub">Every word needs the center letter <b>${esc(r.center.toUpperCase())}</b> and must be at least 4 letters long.</p>
${honeycomb(r.center, r.outer)}

<h2>Hints</h2>
<p class="sub">Open them one at a time, mildest first. ${facts.count} words to find.</p>
${hints}

<h2>Answers</h2>
<details><summary>Pangram${r.pangrams.length === 1 ? "" : "s"} (spoiler)</summary><div class="gw">${r.pangrams.map((w) => `<span class="pg">${esc(w)}</span>`).join("")}</div></details>
<details><summary>All ${facts.count} words (spoiler)</summary><div class="gw">${words}</div></details>

<div class="datenav">
  <span>${nav.older ? `<a href="${spellingBeePath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${spellingBeePath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Spelling Bee Hints & Answers Today (${prettyDate(r.date)}) – NYT Puzzle`,
    `Today's letters, hints and all ${facts.count} answers (with the pangram) for NYT Spelling Bee on ${prettyDate(r.date)}. Open hints first, then reveal the answers.`,
    body,
    spellingBeePath(r.date),
    false,
    CHROME,
  );
}

export function renderSpellingBeeArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${spellingBeePath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    "Spelling Bee Answers Archive – Past Hints & Solutions",
    "Hints and answers for every past NYT Spelling Bee puzzle.",
    `<h1>Archive</h1><p class="sub">${dates.length} Spelling Bee puzzles</p>${list}`,
    `${SPELLING_BEE_HOME}/archive`,
    false,
    CHROME,
  );
}

export function renderSpellingBeeNotFound(date?: string) {
  return layout(
    "Spelling Bee puzzle not found",
    "This Spelling Bee puzzle is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No puzzle for ${esc(date)} yet.` : "No puzzles have been crawled yet."} <a href="${SPELLING_BEE_HOME}/archive">Browse the archive</a>.</p>`,
    SPELLING_BEE_HOME,
    true,
    CHROME,
  );
}

import { esc, layout, prettyDate, type Chrome } from "../render.ts";
import { wordleFacts, wordleHints } from "./hints.ts";
import type { WordleResult } from "./store.ts";

export const WORDLE_HOME = "/wordle";
export const wordlePath = (date: string) => `${WORDLE_HOME}/${date}`;
export const wordleSitemapPaths = (dates: string[]) => [WORDLE_HOME, `${WORDLE_HOME}/archive`, ...dates.map(wordlePath)];

const CHROME: Chrome = {
  brand: "Wordle Answers",
  brandHref: WORDLE_HOME,
  nav: [
    [WORDLE_HOME, "Today"],
    [`${WORDLE_HOME}/archive`, "Archive"],
    ["/connections", "Connections"],
    ["/", "Sudoku"],
  ],
  footer: "Hints and answers for the New York Times Wordle. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.tiles{display:flex;gap:8px;margin:12px 0 4px}
.tile{width:clamp(44px,12vw,64px);aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:clamp(22px,6vw,32px);font-weight:700;color:#fff;background:var(--good);border-radius:6px}
details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:8px}
details summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0;color:var(--muted)}
`,
};

export function renderWordleResult(r: WordleResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const facts = wordleFacts(r.solution);
  const hints = wordleHints(r.solution)
    .map((h, i) => `<details><summary>Hint ${i + 1}</summary><p>${esc(h)}</p></details>`)
    .join("");
  const tiles = [...r.solution.toUpperCase()].map((c) => `<div class="tile">${esc(c)}</div>`).join("");

  // The answer is in the HTML (crawlable) but collapsed, so it only spoils when opened
  const body = `
<h1>${isHome ? "Today's " : ""}Wordle Answer</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">Wordle #${r.number}</span></p>

<div class="stats">
  <div class="stat"><div class="k">Wordle number</div><div class="v">#${r.number}</div></div>
  <div class="stat"><div class="k">Vowels</div><div class="v">${facts.vowels}</div></div>
  <div class="stat"><div class="k">Unique letters</div><div class="v">${facts.unique}</div></div>
  <div class="stat"><div class="k">Repeated letter</div><div class="v">${facts.repeated ? "Yes" : "No"}</div></div>
</div>

<h2>Hints</h2>
<p class="sub">Open one hint at a time, starting from the first.</p>
${hints}

<h2>Answer</h2>
<details><summary>Reveal the answer (spoiler)</summary><div class="tiles">${tiles}</div></details>

<div class="datenav">
  <span>${nav.older ? `<a href="${wordlePath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${wordlePath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Wordle ${r.number} Answer Today (${prettyDate(r.date)}) – Hints & Solution`,
    `Hints and the answer for Wordle #${r.number} on ${prettyDate(r.date)}. Get clues first, then reveal the answer.`,
    body,
    wordlePath(r.date),
    false,
    CHROME,
  );
}

export function renderWordleArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${wordlePath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    "Wordle Answers Archive – Past Hints & Solutions",
    "Hints and answers for every past New York Times Wordle.",
    `<h1>Archive</h1><p class="sub">${dates.length} Wordle answers</p>${list}`,
    `${WORDLE_HOME}/archive`,
    false,
    CHROME,
  );
}

export function renderWordleNotFound(date?: string) {
  return layout(
    "Wordle answer not found",
    "This Wordle answer is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No answer for ${esc(date)} yet.` : "No answers have been crawled yet."} <a href="${WORDLE_HOME}/archive">Browse the archive</a>.</p>`,
    WORDLE_HOME,
    true,
    CHROME,
  );
}

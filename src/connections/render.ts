import { esc, layout, prettyDate, type Chrome } from "../render.ts";
import type { ConnectionsResult } from "./store.ts";

export const CONNECTIONS_HOME = "/connections";
export const connectionsPath = (date: string) => `${CONNECTIONS_HOME}/${date}`;
export const connectionsSitemapPaths = (dates: string[]) => [CONNECTIONS_HOME, `${CONNECTIONS_HOME}/archive`, ...dates.map(connectionsPath)];

const CHROME: Chrome = {
  brand: "Connections Answers",
  brandHref: CONNECTIONS_HOME,
  nav: [
    [CONNECTIONS_HOME, "Today"],
    [`${CONNECTIONS_HOME}/archive`, "Archive"],
    ["/wordle", "Wordle"],
    ["/", "Sudoku"],
  ],
  footer: "Hints and answers for the New York Times Connections. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.words{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:560px}
.word{background:var(--accent-soft);border-radius:8px;padding:clamp(12px,3.4vw,20px) 4px;text-align:center;font-weight:700;font-size:clamp(11px,2.8vw,15px);text-transform:uppercase;overflow-wrap:anywhere}
details{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin-bottom:8px}
details summary{cursor:pointer;font-weight:600}
details p{margin:10px 0 0}
.dot{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:8px;vertical-align:-1px}
.gw{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.gw span{padding:8px 14px;border-radius:8px;font-weight:700;color:#1d1d1b}
.y{background:#f9df6d}.g{background:#a0c35a}.b{background:#b0c4ef}.p{background:#ba81c5}
`,
};

// The NYT lists groups easiest to hardest
const COLORS = [
  { cls: "y", name: "Yellow", level: "easiest" },
  { cls: "g", name: "Green", level: "easy" },
  { cls: "b", name: "Blue", level: "tricky" },
  { cls: "p", name: "Purple", level: "trickiest" },
];

export function renderConnectionsResult(r: ConnectionsResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const words = r.start.map((w) => `<div class="word">${esc(w)}</div>`).join("");
  const label = (i: number) => `<span class="dot ${COLORS[i].cls}"></span>${COLORS[i].name} group (${COLORS[i].level})`;

  // Hints and answers are in the HTML (crawlable) but collapsed, so nothing spoils until opened
  const hints = r.groups.map((g, i) => `<details><summary>${label(i)} – hint</summary><p>Category: <b>${esc(g.title)}</b></p></details>`).join("");
  const answers = r.groups
    .map((g, i) => `<details><summary>${label(i)} – answer (spoiler)</summary><div class="gw">${g.words.map((w) => `<span class="${COLORS[i].cls}">${esc(w)}</span>`).join("")}</div></details>`)
    .join("");

  const body = `
<h1>${isHome ? "Today's " : ""}Connections Hints &amp; Answers</h1>
<p class="sub">${esc(prettyDate(r.date))} · <span class="badge">NYT Connections</span></p>

<h2>The 16 words</h2>
<p class="sub">Today's words, in the starting order of the board.</p>
<div class="words">${words}</div>

<h2>Hints</h2>
<p class="sub">Open one group at a time. Categories are revealed, not the words.</p>
${hints}

<h2>Answers</h2>
${answers}

<div class="datenav">
  <span>${nav.older ? `<a href="${connectionsPath(nav.older)}">← ${esc(prettyDate(nav.older))}</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${connectionsPath(nav.newer)}">${esc(prettyDate(nav.newer))} →</a>` : ""}</span>
</div>`;

  return layout(
    `Connections Hints & Answers Today (${prettyDate(r.date)}) – NYT Puzzle`,
    `Today's 16 words, category hints and the answers for NYT Connections on ${prettyDate(r.date)}. Open hints first, then reveal the answers.`,
    body,
    connectionsPath(r.date),
    false,
    CHROME,
  );
}

export function renderConnectionsArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive">${dates.map((d) => `<li><a href="${connectionsPath(d)}"><b>${esc(prettyDate(d))}</b><br><span style="color:var(--muted)">${d}</span></a></li>`).join("")}</ul>`
    : `<p class="sub">No results yet. Check back after the first daily crawl.</p>`;
  return layout(
    "Connections Answers Archive – Past Hints & Solutions",
    "Hints and answers for every past NYT Connections puzzle.",
    `<h1>Archive</h1><p class="sub">${dates.length} Connections puzzles</p>${list}`,
    `${CONNECTIONS_HOME}/archive`,
    false,
    CHROME,
  );
}

export function renderConnectionsNotFound(date?: string) {
  return layout(
    "Connections puzzle not found",
    "This Connections puzzle is not available yet.",
    `<h1>Not available yet</h1><p class="sub">${date ? `No puzzle for ${esc(date)} yet.` : "No puzzles have been crawled yet."} <a href="${CONNECTIONS_HOME}/archive">Browse the archive</a>.</p>`,
    CONNECTIONS_HOME,
    true,
    CHROME,
  );
}

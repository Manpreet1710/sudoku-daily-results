import { esc, gameBar, GM_REVEAL_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import type { ConnectionsResult } from "./store.ts";

export const CONNECTIONS_HOME = "/connections-hint-today";
export const connectionsPath = (date: string) => `${CONNECTIONS_HOME}/${date}`;
export const connectionsSitemapPaths = (dates: string[]) => [
  CONNECTIONS_HOME,
  `${CONNECTIONS_HOME}/archive`,
  ...dates.map(connectionsPath),
];

const CHROME: Chrome = {
  brand: "Connections Answers",
  brandHref: CONNECTIONS_HOME,
  gameIcon: "🟨",
  nav: [
    [CONNECTIONS_HOME, "Today"],
    [`${CONNECTIONS_HOME}/archive`, "Archive"],
  ],
  footer:
    "Daily hints and answers for the New York Times Connections. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.words-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 4px 0 0;
}
.word-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(14px, 3.5vw, 20px) 6px;
  text-align: center;
  font-weight: 800;
  font-size: clamp(12px, 2.6vw, 15px);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--ink);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-wrap: anywhere;
}
.word-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--shadow);
}

.group-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}
.group-card {
  border-radius: var(--radius);
  padding: 16px 20px;
  border: 1px solid transparent;
}
.gw {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.gw-word {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Color Group Themes */
.cat-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: -1px;
}

.y-dot { background: #eab308; box-shadow: 0 0 6px rgba(234, 179, 8, 0.6); }
.g-dot { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.6); }
.b-dot { background: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.6); }
.p-dot { background: #a855f7; box-shadow: 0 0 6px rgba(168, 85, 247, 0.6); }

/* Light Theme Badges */
.gw-y { background: #fef08a; color: #713f12; border: 1px solid #fde047; }
.gw-g { background: #bbf7d0; color: #14532d; border: 1px solid #86efac; }
.gw-b { background: #bfdbfe; color: #1e3a8a; border: 1px solid #93c5fd; }
.gw-p { background: #e9d5ff; color: #581c87; border: 1px solid #d8b4fe; }

/* Dark Theme overrides */
[data-theme="dark"] .gw-y { background: rgba(234, 179, 8, 0.2); color: #fef08a; border-color: rgba(234, 179, 8, 0.4); }
[data-theme="dark"] .gw-g { background: rgba(34, 197, 94, 0.2); color: #bbf7d0; border-color: rgba(34, 197, 94, 0.4); }
[data-theme="dark"] .gw-b { background: rgba(59, 130, 246, 0.2); color: #bfdbfe; border-color: rgba(59, 130, 246, 0.4); }
[data-theme="dark"] .gw-p { background: rgba(168, 85, 247, 0.2); color: #e9d5ff; border-color: rgba(168, 85, 247, 0.4); }

@media (max-width: 480px) {
  .words-grid { gap: 6px; }
  .word-card { padding: 12px 4px; font-size: 11px; }
}
`,
};

const COLORS = [
  { dot: "y-dot", badge: "gw-y", name: "Yellow", level: "Straightforward / Easiest" },
  { dot: "g-dot", badge: "gw-g", name: "Green", level: "Medium" },
  { dot: "b-dot", badge: "gw-b", name: "Blue", level: "Challenging" },
  { dot: "p-dot", badge: "gw-p", name: "Purple", level: "Tricky / Wordplay" },
];

export function renderConnectionsResult(
  r: ConnectionsResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean
) {
  const words = r.start
    .map((w) => `<div class="word-card">${esc(w)}</div>`)
    .join("");

  const label = (i: number) =>
    `<span class="cat-dot ${COLORS[i].dot}"></span>${COLORS[i].name} Group <span style="font-weight:500;color:var(--muted);font-size:13px">(${COLORS[i].level})</span>`;

  const hints = r.groups
    .map(
      (g, i) =>
        `<details><summary>${label(i)} – Hint</summary><p style="margin-top:12px;font-size:15px">Theme: <b>${esc(
          g.title
        )}</b></p></details>`
    )
    .join("");

  const solved = r.groups
    .map(
      (g, i) =>
        `<div class="group-card ${COLORS[i].badge}" style="margin-bottom:10px"><div style="font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:.04em">${esc(
          g.title
        )}</div><div style="font-weight:700;font-size:14px;margin-top:4px">${g.words.map((w) => esc(w)).join(" · ")}</div></div>`
    )
    .join("");

  const answers = r.groups
    .map(
      (g, i) =>
        `<div style="margin-top:12px"><p style="margin-bottom:8px">${label(i)}: <b>${esc(g.title)}</b></p>` +
        `<div class="gw">${g.words
          .map((w) => `<span class="gw-word ${COLORS[i].badge}">${esc(w)}</span>`)
          .join("")}</div></div>`
    )
    .join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Connections Hints &amp; Answers</h1>
  <div class="sub">
    <span class="badge">NYT Connections</span>
    <span class="badge good">4 Categories</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer, path: connectionsPath, archive: `${CONNECTIONS_HOME}/archive` })}
  <div class="gm-stage">
    <div class="gm-card">
      <p class="gm-meta"><span>16 words · 4 groups</span><span>Starting layout</span></p>
      <div class="words-grid" data-gm-view="puzzle">${words}</div>
      <div data-gm-view="solution" hidden>${solved}</div>
    </div>
    <div>
      <p class="gm-help">Find <b>four groups of four</b> words that share something in common. Open a hint to see a category title without the words.</p>
      ${hints}
      <div class="gm-actions">
        <button class="gm-btn primary" type="button" data-gm-reveal="Show full solution">Show full solution</button>
      </div>
      <div data-gm-solution-only hidden>${answers}</div>
    </div>
  </div>
</div>

<div class="datenav">
  <span>${
    nav.older
      ? `<a href="${connectionsPath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>`
      : ""
  }</span>
  <span>${
    nav.newer
      ? `<a href="${connectionsPath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>`
      : ""
  }</span>
</div>
${GM_REVEAL_SCRIPT}`;

  return layout(
    `Connections Hints & Answers Today (${prettyDate(r.date)}) – NYT Daily Puzzle`,
    `Today's 16 words, category hints and the complete 4-group answers for NYT Connections on ${prettyDate(
      r.date
    )}. Progressive hints first, then reveal the full answers.`,
    body,
    connectionsPath(r.date),
    false,
    CHROME
  );
}

export function renderConnectionsArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${connectionsPath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No Connections puzzles recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Connections Answers Archive</h1>
  <p class="sub">${dates.length} past NYT Connections puzzles and hints</p>
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
    "Connections Answers Archive – Past Hints & Solutions",
    "Hints and solutions for every past NYT Connections puzzle.",
    body,
    `${CONNECTIONS_HOME}/archive`,
    false,
    CHROME
  );
}

export function renderConnectionsNotFound(date?: string) {
  return layout(
    "Connections Puzzle Not Found",
    "This Connections puzzle is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🟨</div>
      <h1>Puzzle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No puzzle for <b>${esc(date)}</b> has been published yet.` : "No Connections puzzles are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${CONNECTIONS_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="${CONNECTIONS_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    CONNECTIONS_HOME,
    true,
    CHROME
  );
}

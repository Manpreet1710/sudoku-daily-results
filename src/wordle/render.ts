import { esc, gameBar, GM_REVEAL_SCRIPT, layout, prettyDate, shortDate, type Chrome } from "../render.ts";
import { wordleFacts, wordleHints } from "./hints.ts";
import type { WordleResult } from "./store.ts";

export const WORDLE_HOME = "/today-wordle-answer";
export const wordlePath = (date: string) => `${WORDLE_HOME}/${date}`;
export const wordleSitemapPaths = (dates: string[]) => [
  WORDLE_HOME,
  `${WORDLE_HOME}/archive`,
  ...dates.map(wordlePath),
];

const CHROME: Chrome = {
  brand: "Wordle Answers",
  brandHref: WORDLE_HOME,
  gameIcon: "🟩",
  nav: [
    [WORDLE_HOME, "Today"],
    [`${WORDLE_HOME}/archive`, "Archive"],
  ],
  footer:
    "Daily hints and answers for the New York Times Wordle. Not affiliated with or endorsed by The New York Times.",
  css: /* css */ `
.tiles-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}
.tiles {
  display: flex;
  gap: 10px;
  justify-content: center;
  perspective: 600px;
}
.tile {
  width: clamp(52px, 14vw, 70px);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(26px, 7vw, 36px);
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(145deg, #6aaa64 0%, #538d4e 100%);
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(83, 141, 78, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  user-select: none;
  animation: flipTile 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}
.tile:nth-child(1) { animation-delay: 0.05s; }
.tile:nth-child(2) { animation-delay: 0.12s; }
.tile:nth-child(3) { animation-delay: 0.19s; }
.tile:nth-child(4) { animation-delay: 0.26s; }
.tile:nth-child(5) { animation-delay: 0.33s; }

@keyframes flipTile {
  0% { transform: rotateX(-90deg) scale(0.8); opacity: 0; }
  100% { transform: rotateX(0deg) scale(1); opacity: 1; }
}

.hint-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 700;
  margin-right: 8px;
}
.tile.blank {
  background: var(--soft);
  color: var(--muted);
  border: 2px solid var(--line);
  box-shadow: none;
  animation: none;
}
.spoiler-box {
  background: var(--surface);
  border: 2px dashed var(--muted);
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
}
.reveal-btn {
  background: linear-gradient(135deg, #538d4e 0%, #6aaa64 100%);
  color: #fff;
  border: none;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  box-shadow: 0 4px 14px rgba(83, 141, 78, 0.35);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.reveal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(83, 141, 78, 0.45);
}
`,
};

export function renderWordleResult(
  r: WordleResult,
  nav: { newer: string | null; older: string | null },
  isHome: boolean
) {
  const facts = wordleFacts(r.solution);
  const hintLabels = [
    "Vowels & Pattern",
    "Letter Repetition",
    "Starting Letter",
    "Ending Letter",
    "Alphabetical Letters",
  ];
  const hints = wordleHints(r.solution)
    .map(
      (h, i) =>
        `<details><summary><span class="hint-pill">Hint ${i + 1}</span> ${
          hintLabels[i] ?? "Clue"
        }</summary><p style="margin-top:12px;font-size:16px">${esc(h)}</p></details>`
    )
    .join("");

  const tiles = [...r.solution.toUpperCase()]
    .map((c) => `<div class="tile">${esc(c)}</div>`)
    .join("");
  const blanks = [...r.solution].map(() => `<div class="tile blank">?</div>`).join("");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Wordle Hints &amp; Answer</h1>
  <div class="sub">
    <span class="badge">Wordle #${r.number}</span>
    <span class="badge good">NYT Daily</span>
  </div>
</div>

<div class="gm-app">
  ${gameBar({ date: r.date, older: nav.older, newer: nav.newer, path: wordlePath, archive: `${WORDLE_HOME}/archive` })}
  <div class="gm-stage">
    <div class="gm-card">
      <p class="gm-meta"><span>Wordle #${r.number}</span><span>${facts.vowels} vowel${facts.vowels === 1 ? "" : "s"} · ${facts.unique} unique letters · ${facts.repeated ? "repeated letter" : "no repeats"}</span></p>
      <div class="tiles-wrap" data-gm-view="puzzle"><div class="tiles">${blanks}</div></div>
      <div class="tiles-wrap" data-gm-view="solution" hidden><div class="tiles">${tiles}</div></div>
    </div>
    <div>
      <p class="gm-help">Open <b>one hint at a time</b> for a gentle nudge, or reveal the full word when you are ready.</p>
      ${hints}
      <div class="gm-actions">
        <button class="gm-btn primary" type="button" data-gm-reveal="Show full solution">Show full solution</button>
      </div>
      <p data-gm-solution-only hidden style="font-size:14px;color:var(--muted);margin-top:12px">Wordle #${r.number} solution for ${esc(prettyDate(r.date))}</p>
    </div>
  </div>
</div>

<div class="datenav">
  <span>${
    nav.older
      ? `<a href="${wordlePath(nav.older)}" class="prev-day">← ${esc(shortDate(nav.older))}</a>`
      : ""
  }</span>
  <span>${
    nav.newer
      ? `<a href="${wordlePath(nav.newer)}" class="next-day">${esc(shortDate(nav.newer))} →</a>`
      : ""
  }</span>
</div>
${GM_REVEAL_SCRIPT}`;

  return layout(
    `Wordle #${r.number} Answer Today (${prettyDate(r.date)}) – Hints & Solution`,
    `Step-by-step hints and the verified 5-letter solution for Wordle #${r.number} on ${prettyDate(
      r.date
    )}. Progressive clues first, then reveal the answer.`,
    body,
    wordlePath(r.date),
    false,
    CHROME
  );
}

export function renderWordleArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${wordlePath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No Wordle answers recorded yet.</p>`;

  const body = `
<div class="page-header">
  <h1>Wordle Answers Archive</h1>
  <p class="sub">${dates.length} past Wordle daily puzzles and solutions</p>
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
    "Wordle Answers Archive – Past Hints & Solutions",
    "Hints and solutions for every past New York Times Wordle.",
    body,
    `${WORDLE_HOME}/archive`,
    false,
    CHROME
  );
}

export function renderWordleNotFound(date?: string) {
  return layout(
    "Wordle Answer Not Available",
    "This Wordle answer is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🟩</div>
      <h1>Wordle Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No answer for <b>${esc(date)}</b> has been published yet.` : "No Wordle results are available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${WORDLE_HOME}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Wordle</a>
        <a href="${WORDLE_HOME}/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    WORDLE_HOME,
    true,
    CHROME
  );
}

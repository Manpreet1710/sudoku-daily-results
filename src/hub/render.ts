import { esc, layout, shortDate, type Chrome } from "../render.ts";

export const NYT_HUB = "/nyt-games-solver";
export const LINKEDIN_HUB = "/linkedin-games-solver";
export const MORE_HUB = "/puzzle-games-solver";
export const hubSitemapPaths = () => [NYT_HUB, LINKEDIN_HUB, MORE_HUB];

export interface HubGame {
  href: string;
  name: string;
  title?: string; // card heading; defaults to "<name> Solver"
  archive?: string | null; // defaults to "<href>/archive"; null for pages with no archive
  note?: string; // footer text when there is no "latest" date
  icon: string;
  blurb: string;
  tags: string[];
  c1: string; // brand gradient, used for the icon tile and the card accent
  c2: string;
}

export interface Hub {
  href: string;
  brand: string;
  icon: string;
  eyebrow: string;
  title: string;
  lead: string;
  grad: string;
  facts: string[];
  games: HubGame[];
  features: [icon: string, title: string, text: string][];
  faq: [q: string, a: string][];
  others: { href: string; label: string; text: string }[];
  disclaimer: string;
}

export const HUBS: Record<"nyt" | "linkedin" | "more", Hub> = {
  nyt: {
    href: NYT_HUB,
    brand: "NYT Games Solver",
    icon: "🗞️",
    eyebrow: "The New York Times Games",
    title: "NYT Games Solver, Hints & Answers",
    lead: "Stuck on today's puzzle? Get a nudge first, then the answer. Daily hints, full solutions and step-by-step logic for every NYT game we cover, updated as each puzzle goes live.",
    grad: "linear-gradient(135deg, #0f172a 0%, #312e81 55%, #6d28d9 100%)",
    facts: ["6 games", "Updated daily", "Hints before answers"],
    games: [
      { href: "/today-wordle-answer", name: "Wordle", icon: "🟩", blurb: "Today's answer, a nudge for each letter, and every past solution.", tags: ["Hints", "Answers", "Archive"], c1: "#6aaa64", c2: "#3f8a46" },
      { href: "/connections-hint-today", name: "Connections", icon: "🟨", blurb: "Category hints that don't spoil the groups, then the full four-way answer.", tags: ["Category hints", "Groups"], c1: "#f2c94c", c2: "#b07bd8" },
      { href: "/spelling-bee", name: "Spelling Bee", icon: "🐝", blurb: "The pangram, every valid word and starter hints for the day's hive.", tags: ["Pangram", "Word list"], c1: "#f7da21", c2: "#e89b00" },
      { href: "/strands", name: "Strands", icon: "🔤", blurb: "Theme hints, the spangram and where every word sits on the board.", tags: ["Theme", "Spangram"], c1: "#4fb8c4", c2: "#2f78b5" },
      { href: "/pips", name: "Pips", icon: "🎲", blurb: "An interactive solver: click a domino or a cell and it snaps into place.", tags: ["Interactive", "3 levels"], c1: "#fb923c", c2: "#ec4899" },
      { href: "/nyt-sudoku", name: "Sudoku", icon: "🔢", blurb: "Easy, medium and hard with a replayable step-by-step logic timeline.", tags: ["Step-by-step", "3 levels"], c1: "#60a5fa", c2: "#6366f1" },
    ],
    features: [
      ["💡", "Hints first", "Every puzzle starts with gentle hints, so you can get unstuck without seeing the whole answer."],
      ["✅", "Checked answers", "Where we compute a solution ourselves, it is verified against the official answer before it is published."],
      ["🗓️", "Daily archive", "Missed a day? Every recent puzzle is kept, with the same hints and solutions."],
    ],
    faq: [
      ["How often is this updated?", "Each game's page is refreshed automatically when its new puzzle goes live, and we re-check recent days in case one was missed."],
      ["Do you show hints before answers?", "Yes. Wherever it makes sense, hints come first and the full answer is behind a tap, so you choose how much to see."],
      ["Which NYT games are covered?", "Wordle, Connections, Spelling Bee, Strands, Pips and Sudoku. More are added over time."],
    ],
    others: [
      { href: LINKEDIN_HUB, label: "LinkedIn Games Solver", text: "Queens, Tango, Zip and Mini Sudoku with step-by-step logic." },
      { href: MORE_HUB, label: "More Puzzles & Games", text: "Daily Sudoku, Mini Crossword, Word Search, Queens, Tango and Zip." },
    ],
    disclaimer: "Not affiliated with or endorsed by The New York Times. Game names belong to their owners.",
  },
  linkedin: {
    href: LINKEDIN_HUB,
    brand: "LinkedIn Games Solver",
    icon: "🧠",
    eyebrow: "LinkedIn Puzzle Games",
    title: "LinkedIn Games Solver, Hints & Answers",
    lead: "Queens, Tango, Zip and Mini Sudoku, solved by our own logic engine. Follow the reasoning one deduction at a time, or jump straight to the finished board.",
    grad: "linear-gradient(135deg, #0a3d62 0%, #0a66c2 55%, #06b6d4 100%)",
    facts: ["4 games", "Own logic solver", "Replay every step"],
    games: [
      { href: "/linkedin-queens", name: "Queens", icon: "👑", blurb: "Place one queen per row, column and colour region, with every deduction explained.", tags: ["Step-by-step", "Daily"], c1: "#a78bfa", c2: "#6d28d9" },
      { href: "/linkedin-tango", name: "Tango", icon: "☀️", blurb: "Sun and moon grids solved by pure logic, with the reasoning behind each move.", tags: ["Step-by-step", "Daily"], c1: "#fbbf24", c2: "#3b82f6" },
      { href: "/linkedin-zip", name: "Zip", icon: "⚡", blurb: "The full path through the numbered dots, with hints before the route is revealed.", tags: ["Route", "Daily"], c1: "#22d3ee", c2: "#2563eb" },
      { href: "/linkedin-mini-sudoku", name: "Mini Sudoku", icon: "🧩", blurb: "The 6×6 puzzle with its region layout and a replayable logical solution.", tags: ["6×6", "Daily"], c1: "#4ade80", c2: "#0d9488" },
    ],
    features: [
      ["🧠", "Real logic", "No lookup tables: each solution is worked out by our own solver and explained step by step."],
      ["▶️", "Replay it", "Play the solution back at your own speed, or scrub to any step on the timeline."],
      ["🗓️", "Daily archive", "Every recent day stays available with its own board and hints."],
    ],
    faq: [
      ["How are the solutions produced?", "Our own solver reads the day's puzzle and applies logical techniques in order, recording each deduction so you can follow it."],
      ["Can I see just a hint?", "Yes. Hints are separate from the solution, so you can take one nudge and keep playing."],
      ["Which LinkedIn games are covered?", "Queens, Tango, Zip and Mini Sudoku. Each has its own page and archive."],
    ],
    others: [
      { href: NYT_HUB, label: "NYT Games Solver", text: "Wordle, Connections, Spelling Bee, Strands, Pips and Sudoku." },
      { href: MORE_HUB, label: "More Puzzles & Games", text: "Daily Sudoku, Mini Crossword, Word Search, Queens, Tango and Zip." },
    ],
    disclaimer: "Not affiliated with or endorsed by LinkedIn. Game names belong to their owners.",
  },

  more: {
    href: MORE_HUB,
    brand: "More Puzzles & Games",
    icon: "🧩",
    eyebrow: "More puzzles & games",
    title: "More Puzzle Games & Solvers",
    lead: "The rest of our daily puzzles: Sudoku with a replayable solution, Mini Crossword, and the Queens, Tango and Zip Unlimited boards, plus a playable Word Search you can enjoy right in your browser.",
    grad: "linear-gradient(135deg, #064e3b 0%, #0f766e 55%, #d97706 130%)",
    facts: ["6 puzzles & games", "Daily answers", "Play in your browser"],
    games: [
      { href: "/daily-sudoku", name: "Daily Sudoku", icon: "🔢", title: "Daily Sudoku Solver", blurb: "The sudoku.com Daily Challenge with a replayable logic timeline and a verified solution.", tags: ["Daily", "Step-by-step"], c1: "#38bdf8", c2: "#2563eb" },
      { href: "/word-search", name: "Word Search", icon: "🔍", title: "Word Search Game", archive: null, note: "Play free", blurb: "Pick fruits, vegetables, computer and more, choose a difficulty and find every hidden word.", tags: ["Play", "3 levels", "6 topics"], c1: "#f472b6", c2: "#e11d48" },
      { href: "/mini-crossword", name: "Mini Crossword", icon: "✏️", title: "Mini Crossword Answers", blurb: "Clues, hints and the full grid for the daily mini crossword.", tags: ["Clues", "Answers"], c1: "#fbbf24", c2: "#ea580c" },
      { href: "/queens-unlimited", name: "Queens", icon: "👑", title: "Queens Unlimited Solver", blurb: "Daily Queens boards from the Unlimited series, solved with explained logic.", tags: ["Step-by-step", "Daily"], c1: "#c084fc", c2: "#7c3aed" },
      { href: "/tango-unlimited", name: "Tango", icon: "☀️", title: "Tango Unlimited Solver", blurb: "Daily Tango grids from the Unlimited series, with every deduction shown.", tags: ["Step-by-step", "Daily"], c1: "#fcd34d", c2: "#3b82f6" },
      { href: "/zip-unlimited", name: "Zip", icon: "⚡", title: "Zip Unlimited Solver", blurb: "Daily Zip puzzles from the Unlimited series, with hints before the full route.", tags: ["Route", "Daily"], c1: "#22d3ee", c2: "#4f46e5" },
    ],
    features: [
      ["🧠", "Logic you can follow", "Our solvers explain the technique behind each move instead of just handing you the grid."],
      ["🎮", "Play, don't just read", "Word Search runs entirely in your browser, with sound, hints and best times saved on your device."],
      ["🗓️", "Daily archive", "Daily puzzles keep a dated page for every recent day."],
    ],
    faq: [
      ["Where does the daily Sudoku come from?", "From the sudoku.com Daily Challenge. Our own solver works it out step by step and checks the result against the source."],
      ["How are the solutions produced?", "A logic solver applies human techniques in order and records every deduction, so you can replay the reasoning."],
      ["What are the Unlimited puzzles?", "Queens, Tango and Zip puzzles published by independent Unlimited-style sites. We solve each day's board and explain the logic."],
    ],
    others: [
      { href: NYT_HUB, label: "NYT Games Solver", text: "Wordle, Connections, Spelling Bee, Strands, Pips and Sudoku." },
      { href: LINKEDIN_HUB, label: "LinkedIn Games Solver", text: "Queens, Tango, Zip and Mini Sudoku with step-by-step logic." },
    ],
    disclaimer: "Independent puzzle solvers. Not affiliated with the publishers of the puzzles we cover. Game names belong to their owners.",
  },
};

export const HUB_CSS = /* css */ `
.hub-hero {
  position: relative; overflow: hidden; color: #fff; border-radius: 28px; padding: clamp(28px, 5vw, 56px);
  display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 32px; align-items: center;
  box-shadow: var(--shadow-lg);
}
.hub-hero::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(600px 300px at 85% 0%, rgba(255, 255, 255, 0.18), transparent 60%), radial-gradient(500px 280px at 0% 100%, rgba(255, 255, 255, 0.1), transparent 60%);
}
.hub-hero > * { position: relative; }
.hub-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.22); font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.hub-hero h1 { color: #fff; font-size: clamp(30px, 5vw, 48px); line-height: 1.08; margin: 16px 0 14px; letter-spacing: -0.035em; }
.hub-hero p.lead { color: rgba(255, 255, 255, 0.86); font-size: clamp(15px, 2vw, 17px); line-height: 1.65; margin: 0 0 22px; max-width: 54ch; }
.hub-facts { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.hub-facts span { padding: 6px 14px; border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); font-size: 13px; font-weight: 700; }
.hub-cta { display: flex; flex-wrap: wrap; gap: 10px; }
.hub-cta a { padding: 12px 22px; border-radius: var(--radius-pill); font-weight: 800; font-size: 15px; text-decoration: none; transition: transform .15s, background .15s; }
.hub-cta a:hover { transform: translateY(-2px); }
.hub-cta .solid { background: #fff; color: #0f172a; }
.hub-cta .solid:hover { color: #0f172a; }
.hub-cta .ghost { background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.3); color: #fff; }
.hub-cta .ghost:hover { color: #fff; background: rgba(255, 255, 255, 0.2); }

.hub-mosaic { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; transform: rotate(-5deg); padding: 8px; }
.hub-tile {
  aspect-ratio: 1; border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: clamp(30px, 4.2vw, 46px);
  background: linear-gradient(145deg, var(--c1), var(--c2)); box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.45);
  animation: hub-float 6s ease-in-out infinite; animation-delay: var(--d, 0s);
}
.hub-tile:nth-child(even) { transform: translateY(18px); }
@keyframes hub-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
@media (prefers-reduced-motion: reduce) { .hub-tile { animation: none; } }

.hub-section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 44px 0 16px; }
.hub-section-title h2 { margin: 0; }
.hub-section-title span { color: var(--muted); font-size: 14px; font-weight: 600; }
.hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(var(--min, 290px), 100%), 1fr)); gap: 18px; }
.hub-card {
  position: relative; display: flex; flex-direction: column; gap: 12px; padding: 22px; border-radius: 22px;
  background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-sm); overflow: hidden;
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
.hub-card::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, var(--c1), var(--c2)); }
.hub-card:hover { transform: translateY(-4px); box-shadow: 0 18px 36px -12px color-mix(in srgb, var(--c2) 45%, transparent); border-color: color-mix(in srgb, var(--c2) 55%, var(--line)); }
.hub-card-top { display: flex; align-items: center; gap: 14px; }
.hub-icon { flex: none; width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; background: linear-gradient(145deg, var(--c1), var(--c2)); box-shadow: 0 8px 16px -6px color-mix(in srgb, var(--c2) 70%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.45); }
.hub-card h3 { margin: 0; font-size: 20px; letter-spacing: -0.02em; }
.hub-link { color: var(--ink); text-decoration: none; }
.hub-link:hover { color: var(--ink); }
.hub-link::after { content: ""; position: absolute; inset: 0; z-index: 1; }
.hub-card p { margin: 0; color: var(--ink-2); font-size: 14.5px; line-height: 1.55; flex: 1; }
.hub-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.hub-tags span { padding: 3px 10px; border-radius: var(--radius-pill); background: var(--soft); border: 1px solid var(--line); color: var(--ink-2); font-size: 12px; font-weight: 700; }
.hub-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px dashed var(--line); font-size: 13px; font-weight: 700; }
.hub-latest { display: inline-flex; align-items: center; gap: 7px; color: var(--muted); }
.hub-latest i { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
.hub-go { color: var(--accent); }
.hub-arch { position: relative; z-index: 2; color: var(--muted); font-weight: 700; text-decoration: none; }
.hub-arch:hover { color: var(--accent); }

.hub-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.hub-feature { padding: 22px; border-radius: 20px; background: var(--soft); border: 1px solid var(--line); }
.hub-feature b { display: block; font-size: 17px; margin: 10px 0 6px; letter-spacing: -0.01em; }
.hub-feature span.i { font-size: 26px; }
.hub-feature p { margin: 0; font-size: 14.5px; color: var(--ink-2); line-height: 1.6; }

.hub-other { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-top: 44px; padding: 26px 30px; border-radius: 24px; background: var(--accent-soft); border: 1px solid var(--line); }
.hub-other h3 { margin: 0 0 4px; font-size: 20px; }
.hub-other p { margin: 0; color: var(--ink-2); }
.hub-other-links { display: flex; flex-wrap: wrap; gap: 10px; }
.hub-other a { padding: 12px 22px; border-radius: var(--radius-pill); background: var(--accent); color: #fff; font-weight: 800; text-decoration: none; white-space: nowrap; }
.hub-other a:hover { color: #fff; filter: brightness(1.08); }
.hub-faq { max-width: 760px; }
.hub-note { margin-top: 34px; font-size: 13px; color: var(--muted); text-align: center; }

@media (max-width: 860px) {
  .hub-hero { grid-template-columns: 1fr; border-radius: 22px; }
  .hub-mosaic { display: none; }
}
`;

export type HubKind = keyof typeof HUBS;

// `latest` maps a game's href to its most recent saved date (YYYY-MM-DD), when there is one
export function renderHub(kind: HubKind, latest: Record<string, string | undefined> = {}) {
  const h = HUBS[kind];
  const chrome: Chrome = {
    brand: h.brand,
    brandHref: h.href,
    gameIcon: h.icon,
    nav: [
      [h.href, "Home"],
      [h.others[0].href, h.others[0].label.replace(" Solver", "")],
    ],
    footer: h.disclaimer,
    css: HUB_CSS,
  };

  const first = h.games[0];
  const card = (g: HubGame, i: number) => {
    const date = latest[g.href];
    return `<article class="hub-card" style="--c1:${g.c1};--c2:${g.c2}">
  <div class="hub-card-top">
    <span class="hub-icon" aria-hidden="true">${g.icon}</span>
    <h3><a class="hub-link" href="${g.href}">${esc(g.title ?? `${g.name} Solver`)}</a></h3>
  </div>
  <p>${esc(g.blurb)}</p>
  <div class="hub-tags">${g.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
  <div class="hub-foot">
    <span class="hub-latest">${date ? `<i></i>Latest · ${esc(shortDate(date))}` : esc(g.note ?? "Daily puzzle")}</span>
    ${g.archive === null ? "" : `<a class="hub-arch" href="${g.archive ?? `${g.href}/archive`}">Archive</a>`}
    <span class="hub-go">Open →</span>
  </div>
</article>`;
  };

  const body = `
<section class="hub-hero" style="background:${h.grad}">
  <div>
    <span class="hub-eyebrow">${esc(h.eyebrow)}</span>
    <h1>${esc(h.title)}</h1>
    <p class="lead">${esc(h.lead)}</p>
    <div class="hub-facts">${h.facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>
    <div class="hub-cta">
      <a class="solid" href="${first.href}">Start with ${esc(first.name)} →</a>
      <a class="ghost" href="#games">Browse all games</a>
    </div>
  </div>
  <div class="hub-mosaic" aria-hidden="true" style="grid-template-columns:repeat(${Math.min(h.games.length, 6) >= 6 ? 3 : 2},1fr);max-width:${Math.min(h.games.length, 6) >= 6 ? 360 : 250}px;justify-self:center">
    ${h.games.slice(0, 6).map((g, i) => `<div class="hub-tile" style="--c1:${g.c1};--c2:${g.c2};--d:${(i * 0.7).toFixed(1)}s">${g.icon}</div>`).join("")}
  </div>
</section>

<div class="hub-section-title" id="games"><h2>${kind === "more" ? "Pick a puzzle" : "Today's puzzles"}</h2><span>${h.games.length} games, one tap away</span></div>
<div class="hub-grid" style="--min:${h.games.length === 4 ? 440 : 290}px">${h.games.map(card).join("")}</div>

<div class="hub-section-title"><h2>Why use this</h2></div>
<div class="hub-features">
  ${h.features.map(([i, t, p]) => `<div class="hub-feature"><span class="i">${i}</span><b>${esc(t)}</b><p>${esc(p)}</p></div>`).join("")}
</div>

<div class="hub-other">
  <div><h3>Looking for something else?</h3><p>${h.others.map((o) => esc(o.label)).join(" · ")}</p></div>
  <div class="hub-other-links">${h.others.map((o) => `<a href="${o.href}" title="${esc(o.text)}">${esc(o.label)} →</a>`).join("")}</div>
</div>

<div class="hub-section-title"><h2>Questions</h2></div>
<div class="hub-faq">
  ${h.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p style="margin-top:12px;font-size:15px">${esc(a)}</p></details>`).join("")}
</div>
<p class="hub-note">${esc(h.disclaimer)}</p>`;

  return layout(
    `${h.title} – Daily Answers & Step-by-Step Solutions`,
    h.lead,
    body,
    h.href,
    false,
    chrome
  );
}

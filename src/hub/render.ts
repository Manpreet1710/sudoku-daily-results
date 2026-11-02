export interface HubGame {
  href: string;
  name: string;
  title?: string; // card heading; defaults to "<name> Solver"
  note?: string; // footer text when there is no "latest" date
  icon: string;
  blurb: string;
  tags: string[];
  c1: string; // brand gradient, used for the icon tile and the card accent
  c2: string;
}

export interface Hub {
  grad: string;
  games: HubGame[];
}

export const HUBS: Record<"nyt" | "linkedin" | "more", Hub> = {
  nyt: {
    grad: "linear-gradient(135deg, #0f172a 0%, #312e81 55%, #6d28d9 100%)",
    games: [
      { href: "/todays-wordle-answer", name: "Wordle", icon: "🟩", title: "Today's Wordle Answer & Hints", blurb: "Today's answer, a nudge for each letter, and every past solution.", tags: ["Hints", "Answers", "History"], c1: "#6aaa64", c2: "#3f8a46" },
      { href: "/connections-hints-today", name: "Connections", icon: "🟨", title: "Connections Hints & Answers Today", blurb: "Category hints that don't spoil the groups, then the full four-way answer.", tags: ["Category hints", "Groups"], c1: "#f2c94c", c2: "#b07bd8" },
      { href: "/spelling-bee-answers", name: "Spelling Bee", icon: "🐝", title: "Spelling Bee Answers & Pangram", blurb: "The pangram, every valid word and starter hints for the day's hive.", tags: ["Pangram", "Word list"], c1: "#f7da21", c2: "#e89b00" },
      { href: "/todays-nyt-strands-hints-spangram-answers", name: "Strands", icon: "🔤", title: "NYT Strands Hints & Spangram", blurb: "Theme hints, the spangram and where every word sits on the board.", tags: ["Theme", "Spangram"], c1: "#4fb8c4", c2: "#2f78b5" },
      { href: "/nyt-pips-todays-hints-answers", name: "Pips", icon: "🎲", title: "NYT Pips Hints & Answers", blurb: "An interactive solver: click a domino or a cell and it snaps into place.", tags: ["Interactive", "3 levels"], c1: "#fb923c", c2: "#ec4899" },
      { href: "/nyt-sudoku-todays-hints-answers", name: "Sudoku", icon: "🔢", title: "NYT Sudoku Hints & Answers", blurb: "Easy, medium and hard with a replayable step-by-step logic timeline.", tags: ["Step-by-step", "3 levels"], c1: "#60a5fa", c2: "#6366f1" },
    ],
  },
  linkedin: {
    grad: "linear-gradient(135deg, #0a3d62 0%, #0a66c2 55%, #06b6d4 100%)",
    games: [
      { href: "/linkedin-queens-answers", name: "Queens", icon: "👑", title: "LinkedIn Queens Answers", blurb: "Place one queen per row, column and colour region, with every deduction explained.", tags: ["Step-by-step", "Daily"], c1: "#a78bfa", c2: "#6d28d9" },
      { href: "/linkedin-tango-answers", name: "Tango", icon: "☀️", title: "LinkedIn Tango Answers", blurb: "Sun and moon grids solved by pure logic, with the reasoning behind each move.", tags: ["Step-by-step", "Daily"], c1: "#fbbf24", c2: "#3b82f6" },
      { href: "/linkedin-zip-answers", name: "Zip", icon: "⚡", title: "LinkedIn Zip Answers", blurb: "The full path through the numbered dots, with hints before the route is revealed.", tags: ["Route", "Daily"], c1: "#22d3ee", c2: "#2563eb" },
      { href: "/linkedin-mini-sudoku-answers", name: "Mini Sudoku", icon: "🧩", title: "LinkedIn Mini Sudoku Answers", blurb: "The 6×6 puzzle with its region layout and a replayable logical solution.", tags: ["6×6", "Daily"], c1: "#4ade80", c2: "#0d9488" },
    ],
  },

  more: {
    grad: "linear-gradient(135deg, #064e3b 0%, #0f766e 55%, #d97706 130%)",
    games: [
      { href: "/sudoku-game-answers", name: "Sudoku Game", icon: "🔢", title: "Sudoku Game Answers", blurb: "The sudoku.com Daily Challenge with a replayable logic timeline and a verified solution.", tags: ["Daily", "Step-by-step"], c1: "#38bdf8", c2: "#2563eb" },
      { href: "/word-search", name: "Word Search", icon: "🔍", title: "Word Search Game", note: "Play free", blurb: "Pick fruits, vegetables, computer and more, choose a difficulty and find every hidden word.", tags: ["Play", "3 levels", "6 topics"], c1: "#f472b6", c2: "#e11d48" },
      { href: "/mini-crossword-answers", name: "Mini Crossword", icon: "✏️", title: "Mini Crossword Answers", blurb: "Clues, hints and the full grid for the daily mini crossword.", tags: ["Clues", "Answers"], c1: "#fbbf24", c2: "#ea580c" },
      { href: "/queens-game-answers", name: "Queens", icon: "👑", title: "Queens Game Answers", blurb: "Daily Queens boards, solved with explained logic.", tags: ["Step-by-step", "Daily"], c1: "#c084fc", c2: "#7c3aed" },
      { href: "/tango-game-answers", name: "Tango", icon: "☀️", title: "Tango Game Answers", blurb: "Daily Tango grids, with every deduction shown.", tags: ["Step-by-step", "Daily"], c1: "#fcd34d", c2: "#3b82f6" },
      { href: "/zip-game-answers", name: "Zip", icon: "⚡", title: "Zip Game Answers", blurb: "Daily Zip puzzles, with hints before the full route.", tags: ["Route", "Daily"], c1: "#22d3ee", c2: "#4f46e5" },
    ],
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

import { SEO } from "./seo-content.ts";
import { HISTORY_CSS, historyBoard, historyBoards, historyDate, renderHistory } from "./history.ts";
import type { DailyResult } from "./store.ts";
import { cellName } from "./solver.ts";
import { LOGO_SVG } from "./logo.ts";

const SITE_TITLE = process.env.SITE_TITLE || "Daily Puzzle Solvers";
// Public origin used for canonical links and the sitemap; set SITE_URL when the site is served behind another domain
const SITE_URL = (process.env.SITE_URL || process.env.URL || "").replace(/\/+$/, "");

export const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const RESULT_PREFIX = "/sudoku-answer-today";

export const prettyDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

const STYLES = /* css */ `
:root, [data-theme="light"] {
  --font-sans: 'Plus Jakarta Sans', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Pure Crisp White Theme */
  --bg: #fcfcfd;
  --bg-pattern: radial-gradient(#e4e7ec 1px, transparent 1px);
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --surface-hover: #f8fafc;
  --soft: #f8fafc;
  --soft-border: #eaecf0;
  --line: #eaecf0;
  --line-strong: #0f172a;

  --ink: #0f172a;
  --ink-2: #344054;
  --muted: #667085;

  --accent: #4f46e5;
  --accent-ink: #3730a3;
  --accent-soft: #eef2ff;
  --accent-gradient: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  --accent-glow: rgba(79, 70, 229, 0.15);

  --hl: #fef3c7;
  --hl-glow: rgba(245, 158, 11, 0.25);
  --elim: #fee2e2;
  --elim-ink: #dc2626;
  --good: #059669;
  --good-soft: #ecfdf5;
  --warning: #d97706;
  --warning-soft: #fffbeb;

  --radius-sm: 8px;
  --radius: 14px;
  --radius-lg: 20px;
  --radius-pill: 9999px;

  --shadow-sm: 0 1px 2px 0 rgba(16, 24, 40, 0.05);
  --shadow: 0 4px 6px -1px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04);
  --shadow-lg: 0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -4px rgba(16, 24, 40, 0.03);
  --header-bg: rgba(255, 255, 255, 0.94);
}

[data-theme="dark"] {
  --bg: #090d16;
  --bg-pattern: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  --surface: #111827;
  --surface-elevated: #1a2234;
  --surface-hover: #1e293b;
  --soft: #161f30;
  --soft-border: rgba(255, 255, 255, 0.08);
  --line: #1e293b;
  --line-strong: #94a3b8;

  --ink: #f8fafc;
  --ink-2: #cbd5e1;
  --muted: #8292aa;

  --accent: #6366f1;
  --accent-ink: #a5b4fc;
  --accent-soft: rgba(99, 102, 241, 0.16);
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  --accent-glow: rgba(99, 102, 241, 0.35);

  --hl: rgba(234, 179, 8, 0.3);
  --hl-glow: rgba(234, 179, 8, 0.45);
  --elim: rgba(239, 68, 68, 0.25);
  --elim-ink: #f87171;
  --good: #10b981;
  --good-soft: rgba(16, 185, 129, 0.15);
  --warning: #f59e0b;
  --warning-soft: rgba(245, 158, 11, 0.15);

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
  --shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 14px 34px rgba(0, 0, 0, 0.6);
  --header-bg: rgba(11, 15, 25, 0.88);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  margin: 0;
  background: var(--bg);
  background-image: var(--bg-pattern);
  background-size: 24px 24px;
  color: var(--ink);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a { color: var(--accent); text-decoration: none; transition: color 0.15s ease; }
a:hover { color: var(--accent-ink); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: var(--radius-sm); }
[id] { scroll-margin-top: 96px; }

/* Sticky Header & Navigation */
.site {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--header-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05);
}

.bar-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 20px;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-decoration: none;
}
.brand:hover { color: var(--ink); }
.brand-logo { display: block; height: 32px; width: auto; }

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent-gradient);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  box-shadow: 0 3px 10px var(--accent-glow);
}

.brand-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.brand-name { font-weight: 800; font-size: 16px; color: var(--ink); }
.brand-sub { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  color: var(--ink-2);
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s ease;
}
.nav-link:hover {
  background: var(--soft);
  color: var(--ink);
}
.nav-link[aria-current="page"] {
  background: var(--accent-soft);
  color: var(--accent);
}
.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--good);
  box-shadow: 0 0 8px var(--good);
  animation: pulseLive 2s infinite ease-in-out;
}
@keyframes pulseLive {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.theme-btn {
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink-2);
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.theme-btn:hover {
  background: var(--soft);
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}
.theme-btn svg { width: 18px; height: 18px; fill: currentColor; }

/* Games dropdown */
.games-menu { position: relative; margin: 0; background: none; border: 0; box-shadow: none; overflow: visible; }
.games-menu:hover, .games-menu[open] { border: 0; box-shadow: none; }
.games-menu > summary {
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
  user-select: none;
}
.games-menu > summary::-webkit-details-marker { display: none; }
.games-menu > summary::after {
  content: "";
  width: 6px;
  height: 6px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
  transition: transform 0.2s ease;
}
.games-menu[open] > summary::after { transform: translateY(1px) rotate(-135deg); }
.games-menu > summary:hover, .games-menu[open] > summary { border-color: var(--accent); background: var(--soft); }
.games-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: min(560px, calc(100vw - 32px));
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 60;
}
.games-group-title {
  grid-column: 1 / -1;
  padding: 8px 12px 2px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.games-group-title:first-child { padding-top: 2px; }
.game-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s ease;
}
.game-tab:hover { background: var(--soft); color: var(--ink); }
.game-tab[aria-current="page"] { background: var(--accent-soft); color: var(--accent-ink); }
.game-tab .tab-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08), 0 2px 6px -3px rgba(15, 23, 42, 0.25);
}
.game-tab .tab-icon svg { width: 24px; height: 24px; }
/* Game artwork sits on a white tile everywhere, like the main site */
.more-icon, .hub-icon, .home-cat-icons span { background: #fff !important; }
.more-icon svg, .hub-icon svg, .home-cat-icons svg { width: 68%; height: 68%; }
.game-tab .tab-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.game-tab .tag {
  flex: none;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 99px;
  background: var(--soft);
  color: var(--muted);
}
.game-tab[aria-current="page"] .tag { background: var(--surface); color: var(--accent-ink); }

/* Page Layout */
.wrap {
  flex: 1;
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.page-header {
  margin-bottom: 28px;
}
h1 {
  font-size: clamp(28px, 4.6vw, 40px);
  line-height: 1.15;
  margin: 0 0 10px;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--ink);
}
.sub {
  color: var(--muted);
  margin: 0 0 20px;
  font-size: 15px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge.good { background: var(--good-soft); color: var(--good); }
.badge.warn { background: var(--warning-soft); color: var(--warning); }

h2 {
  font-size: 20px;
  line-height: 1.3;
  margin: 32px 0 12px;
  letter-spacing: -0.02em;
  font-weight: 700;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 8px;
}
p { margin: 0 0 16px; color: var(--ink-2); }

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* 2-Column Responsive Layout */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 480px) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; gap: 24px; }
}

/* Bento Stats Grid */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin: 0 0 24px;
}
.stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.stat:hover {
  transform: translateY(-1px);
  border-color: var(--accent);
}
.stat .k {
  font-size: 11px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
}
.stat .v {
  font-size: 24px;
  font-weight: 800;
  margin-top: 4px;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

/* Chips / Tags Cloud */
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  background: var(--surface);
  color: var(--ink-2);
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}
.chip:hover {
  border-color: var(--accent);
  background: var(--soft);
}
.chip b {
  color: var(--accent);
  background: var(--accent-soft);
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  font-size: 12px;
}

/* Accordions (<details>) */
details {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
details:hover {
  border-color: var(--muted);
}
details[open] {
  border-color: var(--accent);
  box-shadow: var(--shadow);
}
details:not(.games-menu) summary {
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  padding: 16px 48px 16px 20px;
  list-style: none;
  position: relative;
  min-height: 52px;
  color: var(--ink);
  user-select: none;
  transition: background 0.15s ease;
}
details summary::-webkit-details-marker { display: none; }
details:not(.games-menu) summary::after {
  content: "";
  position: absolute;
  right: 22px;
  top: 50%;
  width: 8px;
  height: 8px;
  margin-top: -6px;
  border-right: 2px solid var(--muted);
  border-bottom: 2px solid var(--muted);
  transform: rotate(45deg);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
details[open]:not(.games-menu) summary::after {
  transform: rotate(-135deg);
  margin-top: -2px;
  border-color: var(--accent);
}
details:not(.games-menu) summary:hover { background: var(--soft); }
details[open]:not(.games-menu) summary { border-bottom: 1px solid var(--line); background: var(--surface); }
details:not(.games-menu) > :not(summary) { margin-left: 20px; margin-right: 20px; }
details:not(.games-menu) > :nth-child(2) { margin-top: 16px; }
details:not(.games-menu) > :last-child { margin-bottom: 20px; }
details p { margin-top: 0; color: var(--ink-2); line-height: 1.6; }

/* Sudoku Board Styling in Crisp White Theme */
.board-container {
  max-width: 440px;
  margin: 0 auto;
}
.board {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  aspect-ratio: 1;
  border: 3px solid var(--line-strong);
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
  user-select: none;
  box-shadow: var(--shadow-lg);
}
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 4.8vw, 28px);
  font-family: var(--font-mono);
  background: #ffffff;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  transition: background 0.18s ease, color 0.18s ease;
  position: relative;
}
.cell:nth-child(9n) { border-right: 0; }
.cell:nth-child(9n+3), .cell:nth-child(9n+6) { border-right: 3px solid var(--line-strong); }
.cell:nth-child(n+19):nth-child(-n+27), .cell:nth-child(n+46):nth-child(-n+54) { border-bottom: 3px solid var(--line-strong); }
.cell:nth-child(n+73) { border-bottom: 0; }

.cell.given { font-weight: 800; color: #0f172a; }
.cell.solved { color: var(--accent); font-weight: 700; }
.cell.current {
  background: var(--hl) !important;
  color: #000000 !important;
  font-weight: 800;
  box-shadow: inset 0 0 0 2px #d97706;
}
.cell.elim {
  background: var(--elim) !important;
  color: var(--elim-ink) !important;
  box-shadow: inset 0 0 0 2px var(--elim-ink);
}

/* Sudoku Player Controls */
.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
}
.controls input[type=range] {
  flex: 1;
  accent-color: var(--accent);
  height: 6px;
  border-radius: var(--radius-pill);
  cursor: pointer;
}

button {
  font-family: var(--font-sans);
  font-size: 14px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  border-radius: var(--radius);
  padding: 8px 16px;
  min-height: 42px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
button:hover {
  border-color: var(--accent);
  background: var(--soft);
  color: var(--accent);
  transform: translateY(-1px);
}
button.primary {
  background: var(--accent-gradient);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px var(--accent-glow);
}
button.primary:hover {
  box-shadow: 0 6px 18px var(--accent-glow);
  transform: translateY(-1px);
  color: #ffffff;
}

.speed-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--soft);
  padding: 4px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--line);
}
.speed-btn {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  min-height: auto;
  border-radius: var(--radius-pill);
  border: 0;
  background: transparent;
  color: var(--muted);
  box-shadow: none;
}
.speed-btn.active {
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}

.caption {
  min-height: 60px;
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--radius);
  background: var(--soft);
  border: 1px solid var(--line);
  font-size: 14px;
  color: var(--ink-2);
  line-height: 1.5;
}
.caption b { color: var(--ink); font-weight: 700; }
.caption .step-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 700;
  font-size: 12px;
  margin-right: 6px;
}

/* Step list */
ol.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 480px;
  overflow-y: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  scrollbar-width: thin;
}
ol.steps li {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease;
}
ol.steps li:last-child { border-bottom: 0; }
ol.steps li:hover { background: var(--accent-soft); }
ol.steps li.active {
  background: var(--hl);
  color: #0f172a;
}
ol.steps .n {
  color: var(--muted);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--soft);
  border-radius: 6px;
  height: 24px;
  align-self: start;
}
ol.steps li.active .n {
  background: rgba(0, 0, 0, 0.12);
  color: #0f172a;
}
ol.steps .t { font-weight: 700; color: var(--ink); }
ol.steps li.active .t { color: #0f172a; }

/* Game page chrome shared by the board games (same look as the Pips solver) */
.gm-app [hidden] { display: none !important; }
.gm-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; }
.gm-tabs { display: inline-flex; background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 4px; gap: 2px; }
.gm-tabs button { font: inherit; font-weight: 700; font-size: 15px; color: var(--ink-2); background: none; border: 0; border-radius: var(--radius-pill); padding: 9px 20px; cursor: pointer; transition: background .15s, color .15s; }
.gm-tabs button[aria-selected="true"] { background: var(--ink); color: var(--surface); }
.gm-date { display: inline-flex; align-items: center; gap: 10px; background: var(--ink); color: var(--surface); border-radius: var(--radius-pill); padding: 11px 22px; font-weight: 700; font-size: 15px; }
.gm-date:hover { color: var(--surface); filter: brightness(1.15); }
.gm-step { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); color: var(--ink-2); font-weight: 800; }
.gm-step:hover { border-color: var(--accent); color: var(--accent); }
.gm-step[aria-disabled="true"] { opacity: .35; pointer-events: none; }
.gm-stage { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 32px; align-items: start; }
.gm-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); }
.gm-meta { color: var(--muted); font-size: 14px; font-weight: 600; margin: 0 0 12px; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.gm-board { display: flex; justify-content: center; }
.gm-board svg { display: block; width: min(460px, 100%); height: auto; margin: 0 auto; border-radius: 14px; overflow: hidden; }
.gm-help { font-style: italic; color: var(--ink-2); font-size: 14px; margin: 0 0 14px; }
.gm-help b { font-weight: 800; }
.gm-actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0 0; }
.gm-btn { font: inherit; font-weight: 700; font-size: 14px; color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 9px 16px; cursor: pointer; }
.gm-btn:hover { border-color: var(--accent); color: var(--accent); }
.gm-btn.primary { background: var(--accent-gradient); border-color: transparent; color: #fff; }
.gm-btn.primary:hover { color: #fff; filter: brightness(1.06); }
.gm-legend { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px 18px; font-size: 14px; color: var(--ink-2); margin: 0 0 14px; padding: 0; list-style: none; }
.gm-legend b { display: inline-block; min-width: 28px; text-align: center; padding: 1px 6px; margin-right: 6px; border-radius: 6px; background: var(--accent); color: #fff; font-size: 12px; }
.gm-stats { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.gm-stats span { background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 5px 12px; font-size: 13px; font-weight: 700; color: var(--ink-2); }
.gm-done { margin: 14px 0 0; padding: 10px 14px; border-radius: var(--radius); background: var(--good-soft); color: var(--good); font-weight: 700; font-size: 14px; }
.gm-level { margin-top: 28px; }
.gm-level > h3 { font-size: 18px; margin: 0 0 2px; }
.gm-note { color: var(--muted); font-size: 14px; margin: 0 0 10px; }
.gm-steps { margin: 12px 0 0; padding-left: 20px; font-size: 14px; color: var(--ink-2); }
.gm-steps li { margin-bottom: 4px; }
.gm-reveal { display: none; }
.gm-reveal.on { display: block; }
@media (max-width: 860px) { .gm-stage { grid-template-columns: 1fr; gap: 20px; } .gm-card { padding: 16px; } }

/* Written guide under each game */
.seo { margin-top: 48px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 8px 28px 24px; box-shadow: var(--shadow-sm); }
.seo h2 { margin: 24px 0 10px; font-size: 20px; }
.seo h2::before { content: ""; width: 4px; height: 20px; border-radius: 2px; background: var(--accent-gradient); flex: none; }
.seo p { line-height: 1.7; }
.seo ol, .seo ul { margin: 0 0 8px; padding-left: 22px; color: var(--ink-2); line-height: 1.7; }
.seo li { margin-bottom: 6px; }
.seo li::marker { color: var(--accent); font-weight: 800; }
.seo details { background: var(--soft); box-shadow: none; }
.seo details p { margin-bottom: 0; }
@media (max-width: 640px) { .seo { padding: 4px 18px 18px; } }

/* Try more games */
.more-games { margin-top: 48px; }
.more-games h2 { margin-top: 0; }
.more-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 16px; }
.more-card { position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 22px 20px 18px; color: var(--ink); box-shadow: var(--shadow-sm); transition: transform .18s, box-shadow .18s, border-color .18s; }
.more-card::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, var(--c1), var(--c2)); }
.more-card::after { content: ""; position: absolute; right: -40px; top: -40px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--c2) 22%, transparent), transparent 70%); pointer-events: none; }
.more-card:hover { transform: translateY(-4px); box-shadow: 0 18px 36px -12px color-mix(in srgb, var(--c2) 45%, transparent); border-color: color-mix(in srgb, var(--c2) 55%, var(--line)); color: var(--ink); }
.more-icon { width: 52px; height: 52px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 26px; line-height: 1; margin-bottom: 6px; background: linear-gradient(145deg, var(--c1), var(--c2)); box-shadow: 0 8px 16px -6px color-mix(in srgb, var(--c2) 70%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.45); }
.more-name { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
.more-blurb { font-size: 13.5px; line-height: 1.5; color: var(--ink-2); font-weight: 500; flex: 1; }
.more-cta { margin-top: 8px; font-size: 14px; font-weight: 800; color: var(--c2); display: inline-flex; align-items: center; gap: 6px; }
.more-cta i { font-style: normal; transition: transform .18s; }
.more-card:hover .more-cta i { transform: translateX(4px); }

/* Day Navigation */
.datenav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid var(--line);
}
.datenav a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.datenav a:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
  transform: translateY(-1px);
}
.datenav-hint {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}
@media (max-width: 640px) {
  .datenav { flex-direction: column; align-items: stretch; }
  .datenav a { justify-content: center; }
}

/* Footer */
footer {
  border-top: 1px solid var(--line);
  background: var(--surface);
  margin-top: auto;
}
footer .in {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 20px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
footer a { color: var(--muted); text-decoration: underline; }
footer a:hover { color: var(--accent); }
.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 640px) {
  .wrap { padding: 20px 16px 60px; }
  .bar-wrap { padding: 0 16px; }
  .card { padding: 16px; }
  .brand-sub { display: none; }
  .brand { min-width: 0; gap: 10px; }
  .brand-name { font-size: 15px; line-height: 1.15; }
  .sub-nav .nav-link:first-child { display: none; }
  .brand-icon { width: 34px; height: 34px; }
  .brand-logo { height: 26px; }
  .nav-link { padding: 8px 10px; }
  .header-right { gap: 4px; }
  .games-menu > summary { padding: 0 12px; }
  .games-menu { position: static; }
  .games-panel { left: 16px; right: 16px; width: auto; top: 68px; position: fixed; grid-template-columns: 1fr; max-height: calc(100vh - 88px); overflow-y: auto; }
}
${HISTORY_CSS}
`;

// Yesterday / Today links under a game page; nav holds hrefs
export const dateNav = (nav: { newer: string | null; older: string | null }) => `<div class="datenav">
  <span>${nav.older ? `<a href="${nav.older}" class="prev-day" title="Previous day (Left Arrow)">← Yesterday</a>` : ""}</span>
  <span>${nav.newer ? `<a href="${nav.newer}" class="next-day" title="Next day (Right Arrow)">Today →</a>` : ""}</span>
</div>`;

// Top bar of a game page: optional tabs, then previous day / date pill / next day
export function gameBar(o: {
  date: string;
  older: string | null; // href of the previous page, if any
  newer: string | null;
  tabs?: { id: string; label: string }[];
  tabsId?: string;
  tabAttr?: string;
}) {
  const step = (href: string | null, arrow: string, title: string) =>
    href ? `<a class="gm-step" href="${href}" title="${title}">${arrow}</a>` : `<span class="gm-step" aria-disabled="true">${arrow}</span>`;
  const attr = o.tabAttr ?? "data-gm-tab";
  const tabs = o.tabs?.length
    ? `<div class="gm-tabs" id="${o.tabsId ?? "gmTabs"}" role="tablist">${o.tabs
        .map((t, i) => `<button type="button" role="tab" ${attr}="${t.id}" aria-selected="${i === 0}">${esc(t.label)}</button>`)
        .join("")}</div>`
    : "";
  return `<div class="gm-bar">${tabs}${step(o.older, "‹", "Previous day")}<span class="gm-date">${esc(shortDate(o.date))}, ${o.date.slice(0, 4)}</span>${step(o.newer, "›", "Next day")}</div>`;
}

// Switches [data-gm-panel] blocks from the [data-gm-tab] buttons of #gmTabs (and reflects the choice in the URL hash)
export const GM_TABS_SCRIPT = `<script>
(() => {
  const tabs = document.getElementById("gmTabs");
  if (!tabs) return;
  const panels = [...document.querySelectorAll("[data-gm-panel]")];
  const show = (id) => {
    panels.forEach((p) => { p.hidden = p.dataset.gmPanel !== id; });
    tabs.querySelectorAll("[data-gm-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.gmTab === id)));
  };
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-gm-tab]");
    if (!b) return;
    history.replaceState(null, "", "#" + b.dataset.gmTab);
    show(b.dataset.gmTab);
  });
  const h = location.hash.slice(1);
  if (panels.some((p) => p.dataset.gmPanel === h)) show(h);
})();
</script>`;

// A [data-gm-reveal] button swaps the puzzle board and the solved board inside its .gm-stage
export const GM_REVEAL_SCRIPT = `<script>
(() => {
  document.querySelectorAll("[data-gm-reveal]").forEach((btn) => {
    const stage = btn.closest(".gm-stage");
    const puzzle = stage.querySelector('[data-gm-view="puzzle"]');
    const solved = stage.querySelector('[data-gm-view="solution"]');
    const extra = stage.querySelectorAll("[data-gm-solution-only]");
    btn.addEventListener("click", () => {
      const on = extra.length ? extra[0].hidden : solved.hidden;
      if (solved) { solved.hidden = !on; puzzle.hidden = on; }
      extra.forEach((e) => { e.hidden = !on; });
      btn.textContent = on ? "Hide solution" : btn.dataset.gmReveal;
    });
  });
})();
</script>`;

export interface Chrome {
  brand: string;
  brandHref: string;
  nav: [href: string, label: string][];
  footer: string;
  css?: string;
  gameIcon?: string;
}

const SUDOKU_CHROME: Chrome = {
  brand: SITE_TITLE,
  brandHref: RESULT_PREFIX,
  nav: [
    [RESULT_PREFIX, "Today"],
  ],
  footer: "Puzzles from the sudoku.com Daily Challenge. Solutions and step-by-step logic computed independently by our open-source solver.",
  gameIcon: "🔢",
};

export type GameGroup = "NYT" | "LinkedIn" | "More puzzles";

export const GAMES: { href: string; label: string; icon: string; tag: string; group: GameGroup }[] = [
  { href: "/nyt-wordle-answer-today", label: "Wordle", icon: "🟩", tag: "NYT", group: "NYT" },
  { href: "/nyt-connections-hints-answers-today", label: "Connections", icon: "🟨", tag: "NYT", group: "NYT" },
  { href: "/nyt-spelling-bee-answers-today", label: "Spelling Bee", icon: "🐝", tag: "NYT", group: "NYT" },
  { href: "/nyt-strands-hints-spangram-answers-today", label: "Strands", icon: "🔤", tag: "NYT", group: "NYT" },
  { href: "/nyt-pips-hints-answers-today", label: "Pips", icon: "🎲", tag: "NYT", group: "NYT" },
  { href: "/nyt-sudoku-hints-answers-today", label: "NYT Sudoku", icon: "🔢", tag: "NYT", group: "NYT" },
  { href: "/linkedin-queens-answer-today", label: "Queens", icon: "👑", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/linkedin-tango-answer-today", label: "Tango", icon: "☀️", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/linkedin-zip-answer-today", label: "Zip", icon: "⚡", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/linkedin-mini-sudoku-answer-today", label: "Mini Sudoku", icon: "🧩", tag: "LinkedIn", group: "LinkedIn" },
  { href: RESULT_PREFIX, label: "Sudoku Game", icon: "🔢", tag: "Daily", group: "More puzzles" },
  { href: "/mini-crossword-answers-today", label: "Mini Crossword", icon: "✏️", tag: "Daily", group: "More puzzles" },
  { href: "/queens-game-answer-today", label: "Queens Game", icon: "👑", tag: "Daily", group: "More puzzles" },
  { href: "/tango-game-answer-today", label: "Tango Game", icon: "☀️", tag: "Daily", group: "More puzzles" },
  { href: "/zip-game-answer-today", label: "Zip Game", icon: "⚡", tag: "Daily", group: "More puzzles" },
  { href: "/word-search-puzzle", label: "Word Search", icon: "🔍", tag: "Unlimited", group: "More puzzles" },
];

// Blurb and brand colours used by the "Try more" cards
const GAME_META: Record<string, { blurb: string; c1: string; c2: string }> = {
  "/nyt-wordle-answer-today": { blurb: "Today's answer, a nudge for each letter, and every past solution.", c1: "#6aaa64", c2: "#3f8a46" },
  "/nyt-connections-hints-answers-today": { blurb: "Category hints that don't spoil the groups, then the full four-way answer.", c1: "#f2c94c", c2: "#b07bd8" },
  "/nyt-spelling-bee-answers-today": { blurb: "The pangram, every valid word and starter hints for the day's hive.", c1: "#f7da21", c2: "#e89b00" },
  "/nyt-strands-hints-spangram-answers-today": { blurb: "Theme hints, the spangram and where every word sits on the board.", c1: "#4fb8c4", c2: "#2f78b5" },
  "/nyt-pips-hints-answers-today": { blurb: "An interactive solver: click a domino or a cell and it snaps into place.", c1: "#fb923c", c2: "#ec4899" },
  "/nyt-sudoku-hints-answers-today": { blurb: "Easy, medium and hard with a replayable step-by-step logic timeline.", c1: "#60a5fa", c2: "#6366f1" },
  "/linkedin-queens-answer-today": { blurb: "Place one queen per row, column and colour region, with every deduction explained.", c1: "#a78bfa", c2: "#6d28d9" },
  "/linkedin-tango-answer-today": { blurb: "Sun and moon grids solved by pure logic, with the reasoning behind each move.", c1: "#fbbf24", c2: "#3b82f6" },
  "/linkedin-zip-answer-today": { blurb: "The full path through the numbered dots, with hints before the route is revealed.", c1: "#22d3ee", c2: "#2563eb" },
  "/linkedin-mini-sudoku-answer-today": { blurb: "The 6×6 puzzle with its region layout and a replayable logical solution.", c1: "#4ade80", c2: "#0d9488" },
  "/sudoku-answer-today": { blurb: "The sudoku.com Daily Challenge with a replayable logic timeline and a verified solution.", c1: "#38bdf8", c2: "#2563eb" },
  "/word-search-puzzle": { blurb: "Pick fruits, vegetables, computer and more, choose a difficulty and find every hidden word.", c1: "#f472b6", c2: "#e11d48" },
  "/mini-crossword-answers-today": { blurb: "Clues, hints and the full grid for the daily mini crossword.", c1: "#fbbf24", c2: "#ea580c" },
  "/queens-game-answer-today": { blurb: "Daily Queens boards, solved with explained logic.", c1: "#c084fc", c2: "#7c3aed" },
  "/tango-game-answer-today": { blurb: "Daily Tango grids, with every deduction shown.", c1: "#fcd34d", c2: "#3b82f6" },
  "/zip-game-answer-today": { blurb: "Daily Zip puzzles, with hints before the full route.", c1: "#22d3ee", c2: "#4f46e5" },
};

// Game artwork shared with the main Words With Letters site (_includes/home/game-art.html), 48x48 on a white tile
const GAME_ART: Record<string, string> = {
  wordle: '<rect x="5" y="9" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="18.5" y="9" width="11" height="11" rx="2.5" fill="#c9b458"/><rect x="32" y="9" width="11" height="11" rx="2.5" fill="#787c7e"/><rect x="5" y="23" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="18.5" y="23" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="32" y="23" width="11" height="11" rx="2.5" fill="#c9b458"/><rect x="5" y="37" width="38" height="4" rx="2" fill="#d3d6da"/>',
  connections: '<rect x="5" y="5" width="18" height="18" rx="4" fill="#f9df6d"/><rect x="25" y="5" width="18" height="18" rx="4" fill="#a0c35a"/><rect x="5" y="25" width="18" height="18" rx="4" fill="#b0c4ef"/><rect x="25" y="25" width="18" height="18" rx="4" fill="#ba81c5"/>',
  spellingbee: '<path d="M24 4l9 5.2v10.4L24 24.8l-9-5.2V9.2z" fill="#f7da21"/><path d="M14.5 21l9 5.2v10.4l-9 5.2-9-5.2V26.2z" fill="#e6e6e6"/><path d="M33.5 21l9 5.2v10.4l-9 5.2-9-5.2V26.2z" fill="#e6e6e6"/><text x="24" y="19" text-anchor="middle" font-size="10" font-weight="900" fill="#1e1b2e" font-family="Arial,sans-serif">B</text>',
  strands: '<rect x="4" y="4" width="40" height="40" rx="8" fill="#e8f3fb"/><path d="M13 13 L24 24 L35 13 M24 24 L24 36" stroke="#5ab0e6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M13 35 L35 35" stroke="#f5c84c" stroke-width="7" stroke-linecap="round"/><g fill="#1e1b2e"><circle cx="13" cy="13" r="2.4"/><circle cx="24" cy="24" r="2.4"/><circle cx="35" cy="13" r="2.4"/><circle cx="24" cy="35" r="2.4"/><circle cx="13" cy="35" r="2.4"/><circle cx="35" cy="35" r="2.4"/></g>',
  pips: '<rect x="6" y="9" width="36" height="17" rx="4" fill="#fff" stroke="#1e1b2e" stroke-width="2.5"/><path d="M24 9v17" stroke="#1e1b2e" stroke-width="2.5"/><g fill="#e11d48"><circle cx="13" cy="14" r="2.2"/><circle cx="17.5" cy="21" r="2.2"/><circle cx="30" cy="17.5" r="2.2"/><circle cx="36" cy="14" r="2.2"/><circle cx="36" cy="21" r="2.2"/></g><rect x="10" y="30" width="28" height="11" rx="3" fill="#fbbf24"/><rect x="24" y="30" width="14" height="11" rx="3" fill="#a855f7"/>',
  sudoku: '<rect x="5" y="5" width="38" height="38" rx="6" fill="#fff" stroke="#4f46e5" stroke-width="2.5"/><path d="M17.7 5v38M30.3 5v38M5 17.7h38M5 30.3h38" stroke="#c7d2fe" stroke-width="2"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle"><text x="11.3" y="14.6" fill="#4f46e5">5</text><text x="24" y="27.2" fill="#4f46e5">3</text><text x="36.6" y="39.8" fill="#e11d48">9</text><text x="36.6" y="14.6" fill="#1e1b2e">1</text><text x="11.3" y="39.8" fill="#1e1b2e">7</text></g>',
  queens: '<rect x="5" y="5" width="19" height="19" fill="#bfa4f5"/><rect x="24" y="5" width="19" height="19" fill="#f8c78d"/><rect x="5" y="24" width="19" height="19" fill="#9fd6a7"/><rect x="24" y="24" width="19" height="19" fill="#9bc4f6"/><rect x="5" y="5" width="38" height="38" rx="6" fill="none" stroke="#1e1b2e" stroke-width="2.5"/><path transform="translate(8 10)" d="M0 9 L1.3 2 L4.3 5 L6.5 0 L8.7 5 L11.7 2 L13 9 Z" fill="#1e1b2e"/><path transform="translate(27 29)" d="M0 9 L1.3 2 L4.3 5 L6.5 0 L8.7 5 L11.7 2 L13 9 Z" fill="#1e1b2e"/>',
  tango: '<circle cx="15" cy="17" r="8" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"><path d="M15 4v2.5M15 27.5V30M2 17h2.5M25.5 17H28M5.8 7.8l1.8 1.8M22.4 24.4l1.8 1.8M5.8 26.2l1.8-1.8M22.4 9.6l1.8-1.8"/></g><path d="M38 28a9 9 0 1 1-9.5-12A7 7 0 0 0 38 28z" fill="#3b82f6" transform="translate(2 8)"/>',
  zip: '<path d="M12 12 H36 V24 H12 V36 H36" fill="none" stroke="#f97316" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="#fff"><circle cx="12" cy="12" r="7" fill="#1e1b2e"/><text x="12" y="15.2">1</text><circle cx="36" cy="24" r="7" fill="#1e1b2e"/><text x="36" y="27.2">2</text><circle cx="36" cy="36" r="7" fill="#1e1b2e"/><text x="36" y="39.2">3</text></g>',
  minisudoku: '<rect x="6" y="6" width="36" height="36" rx="6" fill="#fff" stroke="#0d9488" stroke-width="2.5"/><path d="M18 6v36M30 6v36M6 24h36" stroke="#99f6e4" stroke-width="2"/><g font-family="Arial,sans-serif" font-weight="900" font-size="10" text-anchor="middle"><text x="12" y="19" fill="#0d9488">2</text><text x="24" y="37" fill="#0d9488">6</text><text x="36" y="19" fill="#1e1b2e">4</text></g>',
  crossword: '<rect x="5" y="5" width="38" height="38" rx="5" fill="#fff" stroke="#1e1b2e" stroke-width="2.5"/><g fill="#1e1b2e"><rect x="5" y="5" width="12.7" height="12.7"/><rect x="30.3" y="30.3" width="12.7" height="12.7"/><rect x="30.3" y="5" width="12.7" height="12.7" opacity="0"/></g><path d="M17.7 5v38M30.3 5v38M5 17.7h38M5 30.3h38" stroke="#1e1b2e" stroke-width="1.6"/><rect x="17.7" y="17.7" width="25.3" height="12.6" fill="#fde68a" opacity=".85"/><g font-family="Arial,sans-serif" font-weight="900" font-size="8" fill="#1e1b2e" text-anchor="middle"><text x="24" y="27">U</text><text x="36.6" y="27">P</text></g>',
  wordsearch: '<rect x="5" y="5" width="38" height="38" rx="6" fill="#fff"/><g font-family="Arial,sans-serif" font-weight="800" font-size="8" fill="#6b7280" text-anchor="middle"><text x="12" y="15">K</text><text x="24" y="15">W</text><text x="36" y="15">E</text><text x="12" y="27">P</text><text x="24" y="27">O</text><text x="36" y="27">A</text><text x="12" y="39">R</text><text x="24" y="39">D</text><text x="36" y="39">T</text></g><path d="M9 12 L39 40" stroke="#ec4899" stroke-width="7" stroke-linecap="round" opacity=".35"/><circle cx="31" cy="31" r="7" fill="none" stroke="#1e1b2e" stroke-width="3"/><path d="m36 36 6 6" stroke="#1e1b2e" stroke-width="3.5" stroke-linecap="round"/>',
};
const GAME_ART_BY_HREF: Record<string, string> = {
  "/nyt-wordle-answer-today": "wordle",
  "/nyt-connections-hints-answers-today": "connections",
  "/nyt-spelling-bee-answers-today": "spellingbee",
  "/nyt-strands-hints-spangram-answers-today": "strands",
  "/nyt-pips-hints-answers-today": "pips",
  "/nyt-sudoku-hints-answers-today": "sudoku",
  "/linkedin-queens-answer-today": "queens",
  "/linkedin-tango-answer-today": "tango",
  "/linkedin-zip-answer-today": "zip",
  "/linkedin-mini-sudoku-answer-today": "minisudoku",
  "/sudoku-answer-today": "sudoku",
  "/mini-crossword-answers-today": "crossword",
  "/queens-game-answer-today": "queens",
  "/tango-game-answer-today": "tango",
  "/zip-game-answer-today": "zip",
  "/word-search-puzzle": "wordsearch",
};
export const gameIconSvg = (href: string) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${GAME_ART[GAME_ART_BY_HREF[href]] ?? '<circle cx="24" cy="24" r="14" fill="#a78bfa"/>'}</svg>`;

export function layout(
  title: string,
  description: string,
  body: string,
  canonicalPath: string,
  noindex = false,
  chrome = SUDOKU_CHROME
) {
  const here = (href: string) => (href === canonicalPath ? ' aria-current="page"' : "");
  const tab = (g: (typeof GAMES)[number]) =>
    `<a href="${g.href}" class="game-tab"${g.href === chrome.brandHref ? ' aria-current="page"' : ""}>` +
    `<span class="tab-icon">${gameIconSvg(g.href)}</span><span class="tab-name">${esc(g.label)}</span>` +
    `<span class="tag">${g.tag}</span></a>`;
  const games = (["NYT", "LinkedIn", "More puzzles"] as const)
    .map((group) => `<div class="games-group-title">${group}</div>${GAMES.filter((g) => g.group === group).map(tab).join("")}`)
    .join("");

  // Written guide (what it is, how to play, tips, FAQ) on result pages; not-found pages skip it
  const seo = SEO[chrome.brandHref];
  const guide =
    seo && !noindex
      ? `<section class="seo">
<h2>What is ${esc(seo.name)}?</h2>
<p>${esc(seo.what)}</p>
<h2>How to use the ${esc(seo.name)} solver</h2>
<ol>${seo.how.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
<h2>Tips for solving ${esc(seo.name)}</h2>
<ul>${seo.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
<h2>${esc(seo.name)} FAQ</h2>
${seo.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
</section>
<script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: seo.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }).replace(/</g, "\\u003c")}</script>`
      : "";

  // "Try more" cards for the other games of the current game's group (NYT, LinkedIn, ...)
  const current = GAMES.find((g) => g.href === chrome.brandHref);
  const moreGames = current
    ? `<section class="more-games"><h2>More ${current.group === "More puzzles" ? "puzzle" : `${current.group} game`} answers</h2><div class="more-grid">${GAMES.filter((g) => g.group === current.group && g !== current)
        .map((g) => {
          const m = GAME_META[g.href] ?? { blurb: "", c1: "#6366f1", c2: "#4f46e5" };
          // These are answer pages, not playable games; only Word Search is played on the site
          const playable = g.href === "/word-search-puzzle";
          return `<a class="more-card" href="${g.href}" style="--c1:${m.c1};--c2:${m.c2}"><span class="more-icon">${gameIconSvg(g.href)}</span><span class="more-name">${esc(playable ? g.label : `${g.label} Answers`)}</span><span class="more-blurb">${esc(m.blurb)}</span><span class="more-cta">${playable ? "Play free" : "See today's answer"} <i>→</i></span></a>`;
        })
        .join("")}</div></section>`
    : "";

  const sub = chrome.nav
    .slice(0, 2)
    .map(([href, label]) => {
      const isToday = label.toLowerCase() === "today";
      const dot = isToday ? '<span class="live-dot" title="Daily update ready"></span>' : "";
      return `<a href="${href}" class="nav-link"${here(href)}>${dot}<span>${esc(label)}</span></a>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#ffffff">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ""}
<link rel="canonical" href="${esc(SITE_URL + canonicalPath)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">

<!-- Typography -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Theme initialization: Defaults to Crisp White Theme -->
<script>
(() => {
  const saved = localStorage.getItem("puzzle_theme_v2");
  const theme = saved === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
})();
</script>

<style>${STYLES}${chrome.css ?? ""}</style>
</head>
<body>

<header class="site">
  <div class="bar-wrap">
    <div class="bar">
      <a class="brand" href="/">${LOGO_SVG}</a>
      <div class="header-right">
        <nav class="sub-nav" aria-label="Page">${sub}</nav>
        <details class="games-menu" id="gamesMenu">
          <summary aria-label="All games">Games</summary>
          <nav class="games-panel" aria-label="Puzzle Games">${games}</nav>
        </details>
        <button id="themeToggle" class="theme-btn" aria-label="Toggle dark/light theme" title="Toggle theme">
          <svg viewBox="0 0 24 24" id="themeIcon">
            <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>

<main class="wrap">
${body}
${guide}
${moreGames}
</main>

<footer>
  <div class="in">
    <div class="footer-row">
      ${chrome.footer ? `<p style="margin:0">${esc(chrome.footer)}</p>` : "<span></span>"}
      <a href="#top" style="font-weight:600">Back to top ↑</a>
    </div>
  </div>
</footer>

<script>
// Global Theme Toggle & Keyboard Navigation
(() => {
  const btn = document.getElementById("themeToggle");
  const html = document.documentElement;
  const sunSvg = '<svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
  const moonSvg = '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>';

  function updateIcon() {
    const isDark = html.getAttribute("data-theme") === "dark";
    if (btn) btn.innerHTML = isDark ? sunSvg : moonSvg;
  }
  updateIcon();

  if (btn) {
    btn.onclick = () => {
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("puzzle_theme_v2", next);
      updateIcon();
    };
  }

  // Games dropdown closes on an outside click or Escape
  const menu = document.getElementById("gamesMenu");
  if (menu) {
    document.addEventListener("click", (e) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") menu.open = false; });
  }

  // Arrow key day navigation
  window.addEventListener("keydown", (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key === "ArrowLeft") {
      const prev = document.querySelector(".datenav a.prev-day");
      if (prev) prev.click();
    } else if (e.key === "ArrowRight") {
      const next = document.querySelector(".datenav a.next-day");
      if (next) next.click();
    }
  });
})();
</script>
</body>
</html>`;
}

function boardCells(puzzle: string, solution: string, puzzleOnly = false) {
  return [...solution]
    .map((d, i) => {
      const given = puzzle[i] !== "0";
      return `<div class="cell ${given ? "given" : "solved"}" data-i="${i}">${given || !puzzleOnly ? d : ""}</div>`;
    })
    .join("");
}

function sudokuHistory(past: DailyResult[]) {
  return renderHistory({
    title: "Daily Sudoku Solutions History",
    intro: "Every past sudoku.com Daily Challenge with its solution, month by month.",
    entries: past.map((r) => ({
      date: r.date,
      heading: historyDate(r.date),
      body: historyBoards([historyBoard(`<div class="board-container"><div class="board">${boardCells(r.puzzle, r.result.solution)}</div></div>`, esc(r.source.difficulty))]),
    })),
  });
}

export function renderResult(r: DailyResult, nav: { newer: string | null; older: string | null }, isHome: boolean, past: DailyResult[] = []) {
  const { result: res } = r;
  const placements = res.steps.filter((s) => s.type === "place").length;
  const title = `Sudoku Daily Challenge ${isHome ? "Today" : "Yesterday"} ${prettyDate(r.date)} – Step-by-Step Solution`;
  const description = `Interactive step-by-step logic solver and complete solution for sudoku.com Daily Challenge on ${prettyDate(r.date)} (${r.source.difficulty}).`;

  const steps = res.steps
    .map((s, idx) => {
      const what = s.type === "place" ? `${cellName(s.cell)} = ${s.digit}` : `Remove ${s.removed.length} candidate${s.removed.length > 1 ? "s" : ""}`;
      return `<li data-k="${idx + 1}"><span class="n">${idx + 1}</span><div><span class="t">${esc(s.tech)}</span> · <span style="font-weight:600;color:var(--accent)">${esc(what)}</span><br><span style="color:var(--muted);font-size:13px">${esc(s.why)}</span></div></li>`;
    })
    .join("");

  const data = JSON.stringify({ puzzle: r.puzzle, steps: res.steps }).replace(/</g, "\\u003c");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : "Yesterday's "}Sudoku Daily Challenge</h1>
  <div class="sub">
    <span class="badge">${esc(r.source.difficulty)}</span>
  </div>
</div>

<div class="gm-app">
${gameBar({ date: r.date, older: nav.older, newer: nav.newer })}
<div class="gm-stage">
  <section class="gm-card">
    <p class="gm-meta"><span style="text-transform:capitalize">${esc(r.source.difficulty)}</span><span>${res.givens} clues</span><span id="stepCount">0 / ${placements} placed</span></p>
    <div class="board-container">
      <div class="board" id="board">${boardCells(r.puzzle, res.solution, true)}</div>
    </div>
    <p class="gm-done" id="doneMsg" hidden>✅ Solved – every cell is in place.</p>
  </section>

  <section>
    <p class="gm-help"><b>Place one</b> to reveal the next logical move, <b>play</b> to watch the whole solve, or <b>click any step</b> in the timeline to preview it.</p>
    <div class="gm-actions" style="margin-top:0">
      <button class="gm-btn" id="next" type="button">💡 Place one</button>
      <button class="gm-btn primary" id="last" type="button">Show full solution</button>
      <button class="gm-btn" id="first" type="button">↺ Reset</button>
    </div>

    <div class="controls" style="gap:12px; margin:16px 0 0; justify-content:flex-start">
      <button id="prev" title="Previous step">◀</button>
      <button id="play" class="primary" style="min-width:105px"><span id="playIcon">▶</span> <span id="playLabel">Play</span></button>
      <div class="speed-picker" title="Playback speed">
        <button type="button" class="speed-btn" data-speed="700">0.5x</button>
        <button type="button" class="speed-btn active" data-speed="350">1x</button>
        <button type="button" class="speed-btn" data-speed="150">2x</button>
      </div>
    </div>
    <div class="controls" style="margin:12px 0 0">
      <input id="slider" type="range" min="0" max="${res.steps.length}" value="0" aria-label="Solve step slider">
    </div>

    <div class="caption" id="caption" style="margin-top:14px">
      <span class="step-tag">Ready</span>
      <b>Original puzzle.</b> ${res.givens} clues given.
    </div>

    <details>
      <summary>Step-by-Step Logic Timeline (${res.steps.length} steps)</summary>
      <ol class="steps" id="steps">${steps}</ol>
    </details>
  </section>
</div>
</div>

${dateNav(nav)}
${isHome ? sudokuHistory(past) : ""}

<script type="application/json" id="data">${data}</script>
<script>
(() => {
  const { puzzle, steps } = JSON.parse(document.getElementById("data").textContent);
  const cells = [...document.querySelectorAll("#board .cell")];
  const slider = document.getElementById("slider");
  const caption = document.getElementById("caption");
  const items = [...document.querySelectorAll("#steps li")];
  const playBtn = document.getElementById("play");
  const playIcon = document.getElementById("playIcon");
  const playLabel = document.getElementById("playLabel");
  const speedBtns = [...document.querySelectorAll(".speed-btn")];

  const totalPlace = steps.filter((x) => x.type === "place").length;
  let k = 0;
  let timer = null;
  let delay = 350;

  speedBtns.forEach((b) => {
    b.onclick = () => {
      speedBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      delay = Number(b.dataset.speed);
      if (timer) {
        clearInterval(timer);
        timer = setInterval(stepForward, delay);
      }
    };
  });

  const cn = (i) => "R" + (Math.floor(i / 9) + 1) + "C" + ((i % 9) + 1);

  function render() {
    const v = [...puzzle].map(Number);
    for (let j = 0; j < k; j++) {
      if (steps[j].type === "place") v[steps[j].cell] = steps[j].digit;
    }
    cells.forEach((c, i) => {
      c.textContent = v[i] || "";
      c.classList.remove("current", "elim");
    });
    items.forEach((li) => li.classList.toggle("active", +li.dataset.k === k));
    slider.value = k;
    const placed = steps.slice(0, k).filter((x) => x.type === "place").length;
    document.getElementById("stepCount").textContent = placed + " / " + totalPlace + " placed";
    document.getElementById("doneMsg").hidden = k < steps.length;

    const s = steps[k - 1];
    if (!s) {
      caption.innerHTML = '<span class="step-tag">Initial State</span> <b>Original puzzle.</b> ' + puzzle.replace(/0/g, "").length + " clues given.";
      return;
    }
    if (s.type === "place") {
      cells[s.cell].classList.add("current");
    } else {
      s.removed.forEach(([c]) => cells[c].classList.add("elim"));
    }
    const extra = s.type === "elim" ? " Removed candidates: " + s.removed.map(([c, d]) => d + " from " + cn(c)).join(", ") + "." : "";
    caption.innerHTML = '<span class="step-tag">Step ' + k + ' of ' + steps.length + '</span> <b>' + s.tech + '.</b> ' + s.why.replace(/</g, "&lt;") + extra;

    const active = items[k - 1];
    if (active && timer) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  const go = (n) => {
    k = Math.max(0, Math.min(steps.length, n));
    render();
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    playIcon.textContent = "▶";
    playLabel.textContent = "Play";
  };

  const stepForward = () => {
    if (k >= steps.length) {
      stop();
    } else {
      go(k + 1);
    }
  };

  document.getElementById("first").onclick = () => { stop(); go(0); };
  document.getElementById("last").onclick = () => { stop(); go(steps.length); };
  document.getElementById("prev").onclick = () => { stop(); go(k - 1); };
  // "Place one" jumps to the next step that actually puts a digit on the board
  document.getElementById("next").onclick = () => {
    stop();
    let n = k + 1;
    while (n < steps.length && steps[n - 1].type !== "place") n++;
    go(n);
  };
  slider.oninput = () => { stop(); go(+slider.value); };
  items.forEach((li) => {
    li.onclick = () => { stop(); go(+li.dataset.k); };
  });

  playBtn.onclick = () => {
    if (timer) {
      stop();
    } else {
      if (k >= steps.length) go(0);
      playIcon.textContent = "⏸";
      playLabel.textContent = "Pause";
      timer = setInterval(stepForward, delay);
    }
  };
})();
</script>`;

  return layout(title, description, body, RESULT_PREFIX);
}

export function renderNotFound(date?: string) {
  return layout(
    "Result Not Available",
    "This puzzle result is not available yet.",
    `<div class="card" style="text-align:center;padding:48px 24px;max-width:540px;margin:40px auto">
      <div style="font-size:48px;margin-bottom:12px">🧩</div>
      <h1>Not Available Yet</h1>
      <p class="sub" style="justify-content:center">${
        date ? `No solution for <b>${esc(date)}</b> has been crawled yet.` : "No results are currently available."
      }</p>
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center">
        <a href="${RESULT_PREFIX}" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
      </div>
    </div>`,
    RESULT_PREFIX,
    true
  );
}

export function renderSitemap(extraPaths: string[] = []) {
  const base = SITE_URL;
  const urls = ["/", RESULT_PREFIX, ...extraPaths];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(base + u)}</loc></url>`).join("\n")}
</urlset>`;
}

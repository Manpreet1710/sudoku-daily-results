import type { DailyResult } from "./store.ts";
import { cellName } from "./solver.ts";

const SITE_TITLE = process.env.SITE_TITLE || "Daily Puzzle Solvers";

export const esc = (s: unknown) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const RESULT_PREFIX = "/sudoku-daily-result";
export const resultPath = (date: string) => `${RESULT_PREFIX}/${date}`;

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
  background: var(--soft);
  font-size: 17px;
}
.game-tab[aria-current="page"] .tab-icon { background: var(--surface); }
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

/* Archive Grid */
.archive-controls {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 240px;
  padding: 10px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  font-family: inherit;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease;
}
.search-input:focus {
  border-color: var(--accent);
  outline: none;
}

.archive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.archive a {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  text-decoration: none;
  color: var(--ink);
  box-shadow: var(--shadow-sm);
  min-height: 90px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.archive a:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.archive a b {
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}
.archive a .date-tag {
  font-size: 13px;
  color: var(--muted);
  font-family: var(--font-mono);
  margin-top: 6px;
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
  .nav-link { padding: 8px 10px; }
  .header-right { gap: 4px; }
  .games-menu > summary { padding: 0 12px; }
  .games-menu { position: static; }
  .games-panel { left: 16px; right: 16px; width: auto; top: 68px; position: fixed; grid-template-columns: 1fr; max-height: calc(100vh - 88px); overflow-y: auto; }
}
`;

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
  brandHref: "/",
  nav: [
    ["/", "Today"],
    ["/archive", "Archive"],
  ],
  footer: "Puzzles from the sudoku.com Daily Challenge. Solutions and step-by-step logic computed independently by our open-source solver.",
  gameIcon: "🔢",
};

export type GameGroup = "NYT" | "LinkedIn" | "More puzzles";

export const GAMES: { href: string; label: string; icon: string; tag: string; group: GameGroup }[] = [
  { href: "/wordle", label: "Wordle", icon: "🟩", tag: "NYT", group: "NYT" },
  { href: "/connections", label: "Connections", icon: "🟨", tag: "NYT", group: "NYT" },
  { href: "/spelling-bee", label: "Spelling Bee", icon: "🐝", tag: "NYT", group: "NYT" },
  { href: "/strands", label: "Strands", icon: "🔤", tag: "NYT", group: "NYT" },
  { href: "/linkedin-queens", label: "Queens", icon: "👑", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/linkedin-tango", label: "Tango", icon: "☀️", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/linkedin-zip", label: "Zip", icon: "⚡", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/mini-sudoku", label: "Mini Sudoku", icon: "🧩", tag: "LinkedIn", group: "LinkedIn" },
  { href: "/", label: "Sudoku", icon: "🔢", tag: "Daily", group: "More puzzles" },
  { href: "/mini-crossword", label: "Mini Crossword", icon: "✏️", tag: "Daily", group: "More puzzles" },
  { href: "/queens", label: "Queens Unlimited", icon: "👑", tag: "Unlimited", group: "More puzzles" },
  { href: "/tango", label: "Tango Unlimited", icon: "☀️", tag: "Unlimited", group: "More puzzles" },
  { href: "/zip", label: "Zip Unlimited", icon: "⚡", tag: "Unlimited", group: "More puzzles" },
];

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
    `<span class="tab-icon">${g.icon}</span><span class="tab-name">${esc(g.label)}</span>` +
    `<span class="tag">${g.tag}</span></a>`;
  const games = (["NYT", "LinkedIn", "More puzzles"] as const)
    .map((group) => `<div class="games-group-title">${group}</div>${GAMES.filter((g) => g.group === group).map(tab).join("")}`)
    .join("");

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
<link rel="canonical" href="${esc((process.env.URL ?? "") + canonicalPath)}">
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
      <a class="brand" href="${chrome.brandHref}">
        <span class="brand-icon">${chrome.gameIcon ?? "🧩"}</span>
        <div class="brand-meta">
          <span class="brand-name">${esc(chrome.brand)}</span>
          <span class="brand-sub">Daily Solutions &amp; Hints</span>
        </div>
      </a>
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
</main>

<footer>
  <div class="in">
    <div class="footer-row">
      <p style="margin:0">${esc(chrome.footer)}</p>
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

function boardCells(puzzle: string, solution: string) {
  return [...solution]
    .map((d, i) => {
      const given = puzzle[i] !== "0";
      return `<div class="cell ${given ? "given" : "solved"}" data-i="${i}">${d}</div>`;
    })
    .join("");
}

export function renderResult(r: DailyResult, nav: { newer: string | null; older: string | null }, isHome: boolean) {
  const { result: res } = r;
  const placements = res.steps.filter((s) => s.type === "place").length;
  const title = `Sudoku Daily Challenge ${prettyDate(r.date)} – Step-by-Step Solution`;
  const description = `Interactive step-by-step logic solver and complete solution for sudoku.com Daily Challenge on ${prettyDate(r.date)} (${r.source.difficulty}).`;

  const techChips = Object.entries(res.techniques)
    .sort((a, b) => b[1]! - a[1]!)
    .map(([t, n]) => `<span class="chip"><span>${esc(t)}</span> <b>×${n}</b></span>`)
    .join("");

  const steps = res.steps
    .map((s, idx) => {
      const what = s.type === "place" ? `${cellName(s.cell)} = ${s.digit}` : `Remove ${s.removed.length} candidate${s.removed.length > 1 ? "s" : ""}`;
      return `<li data-k="${idx + 1}"><span class="n">${idx + 1}</span><div><span class="t">${esc(s.tech)}</span> · <span style="font-weight:600;color:var(--accent)">${esc(what)}</span><br><span style="color:var(--muted);font-size:13px">${esc(s.why)}</span></div></li>`;
    })
    .join("");

  const data = JSON.stringify({ puzzle: r.puzzle, steps: res.steps }).replace(/</g, "\\u003c");

  const body = `
<div class="page-header">
  <h1>${isHome ? "Today's " : ""}Sudoku Daily Challenge</h1>
  <div class="sub">
    <span>📅 ${esc(prettyDate(r.date))}</span>
    <span class="badge">${esc(r.source.difficulty)}</span>
    <span class="badge good">✓ Verified Solution</span>
  </div>
</div>

<div class="layout">
  <section class="card">
    <div class="board-container">
      <div class="board" id="board">${boardCells(r.puzzle, res.solution)}</div>
    </div>

    <!-- Replay Controls -->
    <div class="controls" style="margin-top:20px">
      <button id="first" title="Show original puzzle">⏮ First</button>
      <button id="prev" title="Previous step">◀</button>
      <button id="play" class="primary" style="min-width:105px"><span id="playIcon">▶</span> <span id="playLabel">Play</span></button>
      <button id="next" title="Next step">▶</button>
      <button id="last" title="Show complete solution">⏭ Last</button>
    </div>

    <div class="controls" style="gap:14px; margin-top:14px">
      <input id="slider" type="range" min="0" max="${res.steps.length}" value="${res.steps.length}" aria-label="Solve step slider">
      <div class="speed-picker" title="Playback speed">
        <button type="button" class="speed-btn" data-speed="700">0.5x</button>
        <button type="button" class="speed-btn active" data-speed="350">1x</button>
        <button type="button" class="speed-btn" data-speed="150">2x</button>
      </div>
    </div>

    <div class="caption" id="caption">
      <span class="step-tag">Ready</span>
      <b>Complete solution displayed.</b> Press <b>⏮ First</b> to see given clues, or <b>Play</b> to watch the logic solve step-by-step.
    </div>
  </section>

  <section>
    <div class="stats">
      <div class="stat"><div class="k">Difficulty</div><div class="v" style="text-transform:capitalize;font-size:20px">${esc(r.source.difficulty)}</div></div>
      <div class="stat"><div class="k">Rating</div><div class="v" style="font-size:20px">${esc(res.rating)}</div></div>
      <div class="stat"><div class="k">Given Clues</div><div class="v">${res.givens}</div></div>
      <div class="stat"><div class="k">Moves</div><div class="v">${placements}</div></div>
      <div class="stat"><div class="k">Win Rate</div><div class="v">${r.source.winRate}%</div></div>
      <div class="stat"><div class="k">Solver Time</div><div class="v">${res.timeMs} ms</div></div>
    </div>

    <h2>Techniques Used</h2>
    <div class="chips">${techChips}</div>

    <h2>Step-by-Step Logic Timeline</h2>
    <p class="sub" style="font-size:13px; margin-bottom:10px">Click any step to preview the board at that deduction:</p>
    <ol class="steps" id="steps">${steps}</ol>
  </section>
</div>

<div class="datenav">
  <span>${nav.older ? `<a href="${resultPath(nav.older)}" class="prev-day" title="Previous day (Left Arrow)">← ${esc(shortDate(nav.older))}</a>` : ""}</span>
  <span class="datenav-hint">Tip: Use <b>← / →</b> arrow keys to jump between days</span>
  <span>${nav.newer ? `<a href="${resultPath(nav.newer)}" class="next-day" title="Next day (Right Arrow)">${esc(shortDate(nav.newer))} →</a>` : ""}</span>
</div>

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

  let k = steps.length;
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
  document.getElementById("next").onclick = () => { stop(); go(k + 1); };
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

  return layout(title, description, body, resultPath(r.date));
}

export function renderArchive(dates: string[]) {
  const list = dates.length
    ? `<ul class="archive" id="archiveGrid">${dates
        .map(
          (d) =>
            `<li data-date="${d}"><a href="${resultPath(d)}">` +
            `<b>${esc(prettyDate(d))}</b>` +
            `<span class="date-tag">📅 ${d}</span></a></li>`
        )
        .join("")}</ul>`
    : `<p class="sub">No puzzle results yet. Check back soon!</p>`;

  const body = `
<div class="page-header">
  <h1>Sudoku Solutions Archive</h1>
  <p class="sub">${dates.length} daily challenge puzzles solved step-by-step</p>
</div>

<div class="archive-controls">
  <input type="search" id="archiveSearch" class="search-input" placeholder="Search by date (e.g. 2026-10 or Oct)..." aria-label="Search archive">
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
</script>
`;

  return layout(
    `Sudoku Daily Challenge Archive – All Solutions`,
    `Every sudoku.com Daily Challenge solution, solved step by step.`,
    body,
    "/archive"
  );
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
        <a href="/" class="nav-link" style="background:var(--accent);color:#fff;padding:8px 20px">View Today's Puzzle</a>
        <a href="/archive" class="nav-link" style="background:var(--soft);padding:8px 20px">Browse Archive</a>
      </div>
    </div>`,
    "/",
    true
  );
}

export function renderSitemap(dates: string[], extraPaths: string[] = []) {
  const base = process.env.URL ?? "";
  const urls = ["/", "/archive", ...dates.map(resultPath), ...extraPaths];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(base + u)}</loc></url>`).join("\n")}
</urlset>`;
}

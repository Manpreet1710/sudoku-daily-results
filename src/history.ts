// Month-by-month "Answer Archive" accordion shown under a game's today page.
// Dependency-free on purpose: render.ts imports HISTORY_CSS, so this file must not import render.ts.

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  heading: string; // already-escaped HTML, e.g. a linked "Oct 31, 2026 #1238"
  body: string; // already-escaped HTML with that day's answers
}

export const HISTORY_CSS = /* css */ `
:root { interpolate-size: allow-keywords; }
.history { margin-top: 36px; }
.history h2 { margin-bottom: 6px; }
.history > .sub { margin: 0 0 16px; color: var(--muted); }
.history-months {
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.history-months .history-month { margin: 0; border: 0; border-radius: 0; box-shadow: none; }
.history-months .history-month + .history-month { border-top: 1px solid var(--line); }
.history-months .history-month > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-ink);
  border-bottom: 0;
}
.history-months .history-month > summary::after {
  content: "+";
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  border: 0;
  transform: none;
  font-size: 24px;
  font-weight: 400;
  color: var(--ink);
  line-height: 1;
}
.history-months .history-month[open] > summary::after { content: "\\2212"; transform: none; margin: 0; border: 0; }
.history-month::details-content { block-size: 0; overflow: clip; transition: block-size 0.35s ease, content-visibility 0.35s allow-discrete; }
.history-month[open]::details-content { block-size: auto; }
.history-count { margin-left: auto; font-size: 13px; font-weight: 600; color: var(--muted); }
.history-months .history-month > .history-days { margin: 0; padding: 0 20px 20px; }
.history-day { padding-top: 28px; }
.history-day + .history-day { margin-top: 12px; }
.history-day h3 { margin: 0 0 14px; font-size: 20px; font-style: italic; font-weight: 500; color: var(--ink); }
.history-row { display: flex; gap: 20px; align-items: center; padding: 14px 0; border-top: 1px solid var(--line); }
.history-row:last-child { border-bottom: 1px solid var(--line); }
.history-row b { display: flex; align-items: center; gap: 12px; flex: 0 0 min(36%, 300px); font-size: 15px; line-height: 1.3; text-transform: uppercase; }
.history-row span { font-size: 16px; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; overflow-wrap: anywhere; }
.history-dot {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--c, var(--accent-soft));
}
.history-dot::after { content: "\\2713"; font-size: 13px; font-weight: 800; color: rgba(15, 23, 42, 0.55); }
.history-label { margin: 0 0 8px; text-align: center; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); }
.history-boards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 24px; margin-top: 16px; }
.history-board { margin: 0; min-width: 0; }
.history-board svg { display: block; width: 100%; max-width: 340px; height: auto; margin: 0 auto; border-radius: 14px; overflow: hidden; }
.history-board .board-container { max-width: 340px; }
.history-board .board { box-shadow: var(--shadow-sm); }
.history-board .cell { font-size: clamp(13px, 3.4vw, 20px); }
.history-board .hive-wrap { max-width: 260px; margin: 0 auto; }
@media (max-width: 560px) {
  .history-row { flex-direction: column; gap: 4px; }
  .history-row b { flex-basis: auto; }
  .history-months .history-month > summary { padding: 14px 16px; font-size: 16px; }
  .history-months .history-month > .history-days { padding: 0 16px 16px; }
}
`;

// "Oct 31, 2026"
export const historyDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// A pastel tick circle that leads a row label
export const historyDot = (color: string) => `<span class="history-dot" style="--c:${color}"></span>`;

const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

// Rows inside a day body; labels/values must already be escaped
export const historyRow = (label: string, value: string, dot = "") =>
  `<div class="history-row"><b>${dot}${label}</b><span>${value}</span></div>`;

// A solved board with a caption; `boards` go side by side and wrap on narrow screens
export const historyBoard = (board: string, label: string) =>
  `<figure class="history-board"><figcaption class="history-label">${label}</figcaption>${board}</figure>`;
export const historyBoards = (boards: string[]) => `<div class="history-boards">${boards.join("")}</div>`;

// Entries must be newest first. Every month starts collapsed.
export function renderHistory(o: { title: string; intro: string; entries: HistoryEntry[] }): string {
  if (!o.entries.length) return "";

  const months = new Map<string, HistoryEntry[]>();
  for (const e of o.entries) {
    const ym = e.date.slice(0, 7);
    months.set(ym, [...(months.get(ym) ?? []), e]);
  }

  const items = [...months]
    .map(
      ([ym, days]) =>
        `<details class="history-month"><summary>${monthLabel(ym)}` +
        `<span class="history-count">${days.length} ${days.length === 1 ? "day" : "days"}</span></summary>` +
        `<div class="history-days">${days
          .map((d) => `<div class="history-day"><h3>${d.heading}</h3>${d.body}</div>`)
          .join("")}</div></details>`
    )
    .join("");

  return `<section class="history" aria-label="${o.title}"><h2>${o.title}</h2><p class="sub">${o.intro}</p>` +
    `<div class="history-months">${items}</div></section>`;
}

// Loads the saved result of every date except `skip`, newest first, a few blobs at a time
export async function loadHistory<T>(dates: string[], skip: string, get: (date: string) => Promise<T | null>): Promise<T[]> {
  const wanted = dates.filter((d) => d !== skip);
  const out: (T | null)[] = [];
  for (let i = 0; i < wanted.length; i += 16) out.push(...(await Promise.all(wanted.slice(i, i + 16).map(get))));
  return out.filter((r): r is T => r !== null);
}

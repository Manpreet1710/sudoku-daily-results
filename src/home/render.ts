import { esc, layout, shortDate, type Chrome } from "../render.ts";
import { HUBS, HUB_CSS, type Hub, type HubGame } from "../hub/render.ts";

export const HOME = "/";

const CATEGORIES: { id: "nyt" | "linkedin" | "more"; name: string; hub: Hub }[] = [
  { id: "nyt", name: "NYT Games", hub: HUBS.nyt },
  { id: "linkedin", name: "LinkedIn Games", hub: HUBS.linkedin },
  { id: "more", name: "More Puzzles & Games", hub: HUBS.more },
];

const CSS = /* css */ `
.home-hero {
  position: relative; overflow: hidden; color: #fff; text-align: center; border-radius: 28px; box-shadow: var(--shadow-lg);
  padding: clamp(32px, 6vw, 64px) clamp(18px, 4vw, 48px);
  background: linear-gradient(135deg, #4338ca 0%, #7c3aed 50%, #db2777 100%);
}
.home-hero::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(520px 260px at 15% 0%, rgba(255, 255, 255, 0.2), transparent 60%), radial-gradient(480px 260px at 90% 100%, rgba(255, 255, 255, 0.14), transparent 60%);
}
.home-hero > * { position: relative; }
.home-hero h1 { color: #fff; font-size: clamp(30px, 5.4vw, 52px); line-height: 1.08; letter-spacing: -0.035em; margin: 16px auto 14px; max-width: 18ch; }
.home-hero p.lead { color: rgba(255, 255, 255, 0.88); font-size: clamp(15px, 2vw, 18px); line-height: 1.6; margin: 0 auto 26px; max-width: 58ch; }
.home-search { position: relative; max-width: 560px; margin: 0 auto 18px; }
.home-search svg { position: absolute; left: 18px; top: 50%; translate: 0 -50%; width: 20px; height: 20px; fill: none; stroke: var(--muted); stroke-width: 2; stroke-linecap: round; }
.home-search input {
  width: 100%; font: inherit; font-size: 16px; font-weight: 600; color: var(--ink); background: var(--surface);
  border: 2px solid transparent; border-radius: var(--radius-pill); padding: 16px 22px 16px 50px; box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.45); outline: none;
}
.home-search input:focus { border-color: #fbbf24; }
.home-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.home-chips a { padding: 7px 16px; border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.28); color: #fff; font-size: 13px; font-weight: 700; text-decoration: none; transition: background .15s; }
.home-chips a:hover { background: rgba(255, 255, 255, 0.26); color: #fff; }
.home-chips b { opacity: .75; font-weight: 700; margin-left: 4px; }

.home-cats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
.home-cat {
  position: relative; display: flex; flex-direction: column; gap: 14px; min-height: 230px; padding: 24px; border-radius: 24px; color: #fff; text-decoration: none;
  background: var(--g); box-shadow: var(--shadow); overflow: hidden; transition: transform .2s, box-shadow .2s;
}
.home-cat:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); color: #fff; }
.home-cat::after { content: ""; position: absolute; right: -40px; top: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255, 255, 255, 0.12); }
.home-cat-icons { display: flex; }
.home-cat-icons span { width: 46px; height: 46px; margin-right: -10px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; background: linear-gradient(145deg, var(--c1), var(--c2)); border: 2px solid rgba(255, 255, 255, 0.75); box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25); }
.home-cat h3 { margin: 6px 0 0; color: #fff; font-size: 22px; letter-spacing: -0.02em; position: relative; }
.home-cat p { margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; line-height: 1.55; flex: 1; position: relative; }
.home-cat-go { align-self: flex-start; padding: 8px 16px; border-radius: var(--radius-pill); background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.35); font-size: 13px; font-weight: 800; position: relative; }

.home-group-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 46px 0 16px; }
.home-group-head h2 { margin: 0; }
.home-group-head a { font-size: 14px; font-weight: 700; }
.home-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 14px; }
.home-tile {
  position: relative; display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 18px; text-decoration: none; color: var(--ink);
  background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-sm); transition: transform .15s, border-color .15s, box-shadow .15s;
}
.home-tile:hover { transform: translateY(-3px); color: var(--ink); border-color: color-mix(in srgb, var(--c2) 55%, var(--line)); box-shadow: 0 14px 28px -12px color-mix(in srgb, var(--c2) 45%, transparent); }
.home-tile .hub-icon { width: 48px; height: 48px; font-size: 24px; border-radius: 14px; }
.home-tile div { min-width: 0; flex: 1; }
.home-tile b { display: block; font-size: 15.5px; letter-spacing: -0.01em; }
.home-tile small { display: flex; align-items: center; gap: 6px; margin-top: 2px; color: var(--muted); font-size: 12.5px; font-weight: 600; }
.home-tile small i { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }
.home-tile em { font-style: normal; color: var(--accent); font-weight: 800; }
.home-empty { text-align: center; color: var(--muted); padding: 40px 0; font-weight: 600; }
.home-note { margin-top: 40px; font-size: 13px; color: var(--muted); text-align: center; }
[hidden] { display: none !important; }
`;

const CHROME: Chrome = {
  brand: "Daily Puzzle Solvers",
  brandHref: HOME,
  gameIcon: "🧩",
  nav: [
    [HOME, "Home"],
    ["/daily-sudoku", "Daily Sudoku"],
  ],
  footer: "",
  css: HUB_CSS + CSS,
};

const SEARCH_SCRIPT = `
(() => {
  const input = document.getElementById("homeSearch");
  const tiles = [...document.querySelectorAll(".home-tile")];
  const groups = [...document.querySelectorAll("[data-group]")];
  const empty = document.getElementById("homeEmpty");
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    tiles.forEach((t) => { t.hidden = q !== "" && !t.dataset.q.includes(q); });
    groups.forEach((g) => { g.hidden = !g.querySelector(".home-tile:not([hidden])"); });
    empty.hidden = groups.some((g) => !g.hidden);
  });
})();`;

// `latest` maps a game's href to its most recent saved date (YYYY-MM-DD), when there is one
export function renderHome(latest: Record<string, string | undefined> = {}) {
  const total = CATEGORIES.reduce((n, c) => n + c.hub.games.length, 0);

  const tile = (g: HubGame) => {
    const date = latest[g.href];
    const sub = date ? `<i></i>Latest · ${esc(shortDate(date))}` : esc(g.note ?? "Daily puzzle");
    return `<a class="home-tile" href="${g.href}" style="--c1:${g.c1};--c2:${g.c2}" data-q="${esc(`${g.name} ${g.title ?? ""} ${g.tags.join(" ")}`.toLowerCase())}">
  <span class="hub-icon" aria-hidden="true">${g.icon}</span>
  <div><b>${esc(g.title ?? `${g.name} Solver`)}</b><small>${sub}</small></div>
  <em aria-hidden="true">→</em>
</a>`;
  };

  const body = `
<section class="home-hero">
  <span class="hub-eyebrow">Daily puzzle solvers</span>
  <h1>Hints, answers &amp; solvers for every daily puzzle</h1>
  <p class="lead">Wordle, Connections, Pips, Queens, Sudoku and more. Get a nudge first, then the answer, with step-by-step logic you can replay. Updated every day.</p>
  <div class="home-search">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input id="homeSearch" type="search" placeholder="Search a game: Wordle, Queens, Sudoku…" aria-label="Search games" autocomplete="off">
  </div>
  <div class="home-chips">${CATEGORIES.map((c) => `<a href="#${c.id}">${esc(c.name)}<b>${c.hub.games.length}</b></a>`).join("")}</div>
</section>

<div class="hub-section-title"><h2>Browse by category</h2><span>${total} games</span></div>
<div class="home-cats">
  ${CATEGORIES.map((c) => `<a class="home-cat" href="${c.hub.href}" style="--g:${c.hub.grad}">
    <div class="home-cat-icons">${c.hub.games.slice(0, 5).map((g) => `<span style="--c1:${g.c1};--c2:${g.c2}" aria-hidden="true">${g.icon}</span>`).join("")}</div>
    <h3>${esc(c.name)}</h3>
    <p>${esc(c.hub.games.map((g) => g.name).join(" · "))}</p>
    <span class="home-cat-go">${c.hub.games.length} games · Explore →</span>
  </a>`).join("")}
</div>

${CATEGORIES.map((c) => `<section data-group id="${c.id}">
  <div class="home-group-head"><h2>${esc(c.name)}</h2><a href="${c.hub.href}">View all →</a></div>
  <div class="home-tiles">${c.hub.games.map(tile).join("")}</div>
</section>`).join("\n")}
<p class="home-empty" id="homeEmpty" hidden>No game matches your search. Try “Wordle”, “Queens” or “Sudoku”.</p>

<p class="home-note">${esc(CHROME.footer)}</p>
<script>${SEARCH_SCRIPT}</script>`;

  return layout(
    "Daily Puzzle Solvers – Hints, Answers & Step-by-Step Solutions",
    "Daily hints, answers and step-by-step solvers for NYT Wordle, Connections, Strands, Pips, LinkedIn Queens, Tango, Zip, Sudoku and more. Free, updated every day.",
    body,
    HOME,
    false,
    CHROME
  );
}

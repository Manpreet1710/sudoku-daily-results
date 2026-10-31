import { layout, type Chrome } from "../render.ts";

export const WORD_SEARCH_HOME = "/word-search";
export const wordSearchSitemapPaths = () => [WORD_SEARCH_HOME];

const CHROME: Chrome = {
  brand: "Word Search",
  brandHref: WORD_SEARCH_HOME,
  gameIcon: "🔍",
  nav: [[WORD_SEARCH_HOME, "Play"]],
  footer: "Free unlimited word search puzzles. Everything runs in your browser — no sign-up, nothing is stored on our servers.",
  css: /* css */ `
.ws [hidden] { display: none !important; }
.ws-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); }

/* Menu */
.ws-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 4px; }
.ws-cat {
  font: inherit; color: var(--ink); cursor: pointer; text-align: center;
  background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 22px 12px 18px; display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: transform .15s, border-color .15s, box-shadow .15s, background .15s;
}
.ws-cat:hover { transform: translateY(-3px); border-color: var(--accent); background: var(--surface); box-shadow: var(--shadow-lg); }
.ws-cat-emoji { font-size: 34px; line-height: 1.1; }
.ws-cat-name { font-weight: 800; font-size: 17px; letter-spacing: -0.01em; }
.ws-cat-meta { font-size: 12px; font-weight: 600; color: var(--muted); }

.ws-seg { display: inline-flex; background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 4px; gap: 2px; }
.ws-seg button {
  font: inherit; font-weight: 700; font-size: 14px; color: var(--muted); background: none; border: 0;
  border-radius: var(--radius-pill); padding: 8px 18px; cursor: pointer; transition: background .15s, color .15s;
}
.ws-seg button[aria-checked="true"] { background: var(--accent); color: #fff; box-shadow: 0 2px 8px var(--accent-glow); }
.ws-seg small { font-weight: 600; opacity: .8; margin-left: 4px; }

/* Game layout */
.ws-layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 24px; align-items: start; }
.ws-main { width: 100%; max-width: 620px; margin: 0 auto; }
.ws-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.ws-title { font-weight: 800; font-size: 18px; letter-spacing: -0.01em; display: flex; align-items: center; gap: 8px; margin-right: auto; }
.ws-btn {
  font: inherit; font-weight: 700; font-size: 14px; color: var(--ink-2); background: var(--surface);
  border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 8px 14px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px; box-shadow: var(--shadow-sm); transition: border-color .15s, color .15s;
}
.ws-btn:hover { border-color: var(--accent); color: var(--accent); }
.ws-btn.primary { background: var(--accent-gradient); border-color: transparent; color: #fff; box-shadow: 0 4px 12px var(--accent-glow); }
.ws-btn.primary:hover { color: #fff; filter: brightness(1.06); }
.ws-timer { font-family: var(--font-mono); font-weight: 700; font-size: 15px; font-variant-numeric: tabular-nums; background: var(--accent-soft); color: var(--accent); border-radius: var(--radius-pill); padding: 7px 14px; }
.ws-progress { height: 6px; background: var(--line); border-radius: var(--radius-pill); overflow: hidden; margin-bottom: 14px; }
.ws-progress i { display: block; height: 100%; width: 0; background: var(--accent-gradient); border-radius: inherit; transition: width .35s ease; }

/* Board */
.ws-board { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 14px; box-shadow: var(--shadow-lg); container-type: inline-size; }
.ws-stage { position: relative; touch-action: none; user-select: none; -webkit-user-select: none; cursor: pointer; --n: 10; }
.ws-grid { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(var(--n), 1fr); }
.ws-grid span {
  aspect-ratio: 1; display: flex; align-items: center; justify-content: center; text-transform: uppercase;
  font-weight: 800; color: var(--ink); font-size: clamp(14px, calc((100cqw - 28px) / var(--n) * 0.5), 30px);
}
.ws-svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: visible; }
.ws-cap { stroke-width: 0.8; stroke-linecap: round; fill: none; }
.ws-cap-found { opacity: 0.4; }
.ws-cap-sel { stroke: var(--accent); opacity: 0.35; }
.ws-ring { fill: none; stroke: var(--accent); stroke-width: 0.09; transform-box: fill-box; transform-origin: center; animation: ws-pulse 1s ease-in-out infinite; }
@keyframes ws-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: .4; } }
.ws-miss { animation: ws-shake .25s; }
@keyframes ws-shake { 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }

/* Word list */
.ws-side { position: sticky; top: 88px; padding: 18px; }
.ws-side h3 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); display: flex; justify-content: space-between; }
.ws-side h3 b { color: var(--accent); }
.ws-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ws-list li { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; text-transform: capitalize; background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius-pill); padding: 6px 12px; transition: opacity .2s; }
.ws-list i { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--c); flex: none; }
.ws-list li.done { opacity: .55; text-decoration: line-through; }
.ws-list li.done i { background: var(--c); }

/* Win dialog */
.ws-modal { position: fixed; inset: 0; z-index: 100; background: rgba(9, 13, 22, .55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.ws-dialog { position: relative; overflow: hidden; width: min(400px, 100%); text-align: center; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 30px 24px 24px; box-shadow: var(--shadow-lg); }
.ws-dialog h2 { justify-content: center; margin: 0 0 4px; font-size: 26px; }
.ws-dialog p { color: var(--muted); font-weight: 600; margin: 0 0 20px; }
.ws-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 22px; }
.ws-stats div { background: var(--soft); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px 6px; }
.ws-stats b { display: block; font-family: var(--font-mono); font-size: 20px; color: var(--ink); }
.ws-stats span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.ws-actions { display: grid; gap: 10px; }
.ws-actions .ws-btn { justify-content: center; padding: 12px 16px; font-size: 15px; }
.ws-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.ws-confetti i { position: absolute; top: -12px; width: 8px; height: 14px; border-radius: 2px; animation: ws-fall linear forwards; }
@keyframes ws-fall { to { top: 105%; transform: rotate(540deg); } }

/* About */
.ws-about { margin-top: 36px; }
.ws-about h2 { margin-top: 0; }
.ws-about ol { margin: 0 0 16px; padding-left: 20px; color: var(--ink-2); }
.ws-about li { margin-bottom: 6px; }

@media (max-width: 860px) {
  .ws-layout { grid-template-columns: 1fr; gap: 16px; }
  .ws-side { position: static; }
  .ws-list { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
}
@media (max-width: 560px) {
  .ws-cats { grid-template-columns: 1fr 1fr; gap: 10px; }
  .ws-card { padding: 18px; }
  .ws-board { padding: 10px; }
  .ws-title { width: 100%; }
}
`,
};

const BODY = /* html */ `
<div class="ws">
  <div class="page-header">
    <h1>Word Search</h1>
    <p class="sub"><span class="badge good">Free</span> Unlimited puzzles · no sign-up · works on phone and desktop</p>
  </div>

  <section id="wsMenu" class="ws-card" aria-label="Choose a puzzle">
    <h2 style="margin-top:0">Choose a difficulty</h2>
    <div class="ws-seg" id="wsLevels" role="radiogroup" aria-label="Difficulty">
      <button type="button" role="radio" data-level="easy">Easy<small>8×8</small></button>
      <button type="button" role="radio" data-level="medium">Medium<small>10×10</small></button>
      <button type="button" role="radio" data-level="hard">Hard<small>12×12</small></button>
    </div>
    <h2>Select a category</h2>
    <div class="ws-cats" id="wsCats"></div>
  </section>

  <section id="wsGame" hidden aria-label="Word search puzzle">
    <div class="ws-layout">
      <div class="ws-main">
        <div class="ws-toolbar">
          <div class="ws-title"><span id="wsTitle"></span><span class="badge" id="wsLevelTag"></span></div>
          <span class="ws-timer" id="wsTimer" aria-label="Elapsed time">00:00</span>
          <button class="ws-btn" id="wsHintBtn" type="button">💡 Hint</button>
          <button class="ws-btn" id="wsSound" type="button" aria-label="Mute sounds">🔊</button>
          <button class="ws-btn" id="wsNew" type="button">↻ New</button>
          <button class="ws-btn" id="wsBack" type="button">← Categories</button>
        </div>
        <div class="ws-progress"><i id="wsBar"></i></div>
        <div class="ws-board">
          <div class="ws-stage" id="wsStage">
            <svg class="ws-svg" id="wsSvg" aria-hidden="true"></svg>
            <div class="ws-grid" id="wsGrid" role="img" aria-label="Letter grid"></div>
          </div>
        </div>
      </div>
      <aside class="ws-side ws-card" aria-label="Words to find">
        <h3>Words to find <b id="wsCount"></b></h3>
        <ul class="ws-list" id="wsList"></ul>
      </aside>
    </div>
  </section>

  <div class="ws-modal" id="wsWin" hidden role="dialog" aria-modal="true" aria-labelledby="wsWinTitle">
    <div class="ws-dialog">
      <div class="ws-confetti" id="wsConfetti"></div>
      <h2 id="wsWinTitle">🎉 Puzzle solved!</h2>
      <p id="wsWinSub"></p>
      <div class="ws-stats">
        <div><b id="wsWinTime">00:00</b><span>Time</span></div>
        <div><b id="wsWinHints">0</b><span>Hints</span></div>
        <div><b id="wsWinBest">00:00</b><span>Best</span></div>
      </div>
      <div class="ws-actions">
        <button class="ws-btn primary" id="wsAgain" type="button">Play again</button>
        <button class="ws-btn" id="wsShare" type="button">Share result</button>
        <button class="ws-btn" id="wsOther" type="button">Other category</button>
      </div>
    </div>
  </div>

  <section class="ws-about ws-card">
    <h2>How to play</h2>
    <ol>
      <li>Pick a difficulty and a category — fruits, vegetables, computer, music, countries or animals.</li>
      <li>Find every word from the list hidden in the grid. Words run across, down and diagonally; on Hard they can also be backwards.</li>
      <li>Press on the first letter, drag to the last letter and release. A correct word stays highlighted.</li>
      <li>Stuck? Use <b>Hint</b> to see where one word starts.</li>
    </ol>
    <p style="margin:0">Your best times are saved in this browser only.</p>
  </section>
</div>
<script src="/assets/word-search.js" defer></script>
`;

export function renderWordSearch() {
  return layout(
    "Word Search – Free Online Word Search Puzzles",
    "Play free word search puzzles online. Choose fruits, vegetables, computer, music, countries or animals, pick a difficulty and find all the hidden words.",
    BODY,
    WORD_SEARCH_HOME,
    false,
    CHROME
  );
}

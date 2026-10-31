(() => {
  const LEVELS = {
    easy: { size: 8, words: 7, label: "Easy", dirs: [[0, 1], [1, 0], [1, 1], [-1, 1]] },
    medium: { size: 10, words: 10, label: "Medium", dirs: [[0, 1], [1, 0], [1, 1], [-1, 1]] },
    hard: { size: 12, words: 13, label: "Hard", dirs: [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]] },
  };
  const COLORS = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#6366f1", "#a855f7", "#ec4899", "#84cc16", "#06b6d4", "#f59e0b", "#8b5cf6"];
  const CATEGORIES = {
    fruits: { name: "Fruits", emoji: "🍎", words: "apple apricot avocado banana berries blueberry cherry citrus coconut cranberry durian figs grape grapefruit guava kiwi lemon lime lychee mango mandarin melon nectarine orange papaya peach pear plantain plum raspberry strawberry tomato watermelon" },
    vegetables: { name: "Vegetables", emoji: "🥕", words: "asparagus beans beetroot broccoli cabbage carrot celery corn cucumber eggplant garlic ginger kale leek lettuce mushroom okra onion peas pepper potato pumpkin radish spinach squash turnip zucchini" },
    computer: { name: "Computer", emoji: "💻", words: "battery browser cable cursor database desktop email file folder hardware internet keyboard laptop memory monitor mouse network password printer processor program router scanner screen server software speaker tablet webcam website" },
    music: { name: "Music", emoji: "🎵", words: "album bass beat cello chorus concert drums flute guitar harmony harp jazz lyrics melody note opera piano rhythm saxophone singer song tempo trumpet tune ukulele violin" },
    countries: { name: "Countries", emoji: "🌍", words: "argentina brazil canada chile china cuba denmark egypt france germany ghana greece india indonesia ireland italy japan kenya mexico nepal norway peru poland portugal russia spain sweden turkey vietnam" },
    animals: { name: "Animals", emoji: "🦁", words: "bear camel cheetah deer dolphin donkey eagle elephant falcon fox giraffe horse kangaroo leopard lion monkey otter panda penguin rabbit rhino tiger turtle wolf zebra" },
  };

  const $ = (id) => document.getElementById(id);
  const SVGNS = "http://www.w3.org/2000/svg";
  const rand = (n) => Math.floor(Math.random() * n);
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const bestKey = (cat, level) => `ws-best-${cat}-${level}`;

  // ---------- sound (synthesised with Web Audio, no files) ----------
  let muted = store.get("ws-muted") === "1";
  let audio = null;
  function tone(freq, delay, dur, type, vol) {
    if (muted) return;
    if (!audio) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; audio = new A(); }
    if (audio.state === "suspended") audio.resume();
    const t = audio.currentTime + delay;
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const sfx = {
    start: () => tone(480, 0, 0.06, "triangle", 0.08),
    step: (n) => tone(420 + n * 35, 0, 0.05, "triangle", 0.05),
    found: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.28, "sine", 0.16)),
    miss: () => tone(150, 0, 0.18, "sawtooth", 0.06),
    hint: () => { tone(880, 0, 0.12, "sine", 0.1); tone(1175, 0.13, 0.18, "sine", 0.1); },
    win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.35, "sine", 0.16)),
  };

  let level = store.get("ws-level") in LEVELS ? store.get("ws-level") : "medium";
  let game = null;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function build(catId, lvl) {
    const { size, words: count, dirs } = LEVELS[lvl];
    const pool = CATEGORIES[catId].words.split(" ").filter((w) => w.length <= size);
    const diagDirs = dirs.filter(([a, b]) => a && b);
    const flatDirs = dirs.filter(([a, b]) => !a || !b);
    // Diagonals are favoured so puzzles are not just rows and columns
    const pickDir = () => { const set = Math.random() < 0.6 ? diagDirs : flatDirs; return set[rand(set.length)]; };
    const isDiag = (p) => p.cells[0][0] !== p.cells[1][0] && p.cells[0][1] !== p.cells[1][1];
    for (let attempt = 0; attempt < 100; attempt++) {
      const grid = Array.from({ length: size }, () => Array(size).fill(""));
      const picked = shuffle(pool.slice()).slice(0, count).sort((a, b) => b.length - a.length);
      const placed = [];
      for (const word of picked) {
        for (let t = 0; t < 400; t++) {
          const [dr, dc] = pickDir();
          const r = rand(size), c = rand(size);
          const er = r + dr * (word.length - 1), ec = c + dc * (word.length - 1);
          if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
          let ok = true;
          for (let i = 0; i < word.length && ok; i++) {
            const ch = grid[r + dr * i][c + dc * i];
            if (ch && ch !== word[i]) ok = false;
          }
          if (!ok) continue;
          const cells = [];
          for (let i = 0; i < word.length; i++) {
            grid[r + dr * i][c + dc * i] = word[i];
            cells.push([r + dr * i, c + dc * i]);
          }
          placed.push({ word, cells });
          break;
        }
      }
      if (placed.length === picked.length && placed.filter(isDiag).length >= Math.ceil(count * 0.4)) {
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = String.fromCharCode(97 + rand(26));
        placed.sort((a, b) => a.word.localeCompare(b.word));
        placed.forEach((p, i) => { p.color = COLORS[i % COLORS.length]; p.found = false; });
        return { size, grid, words: placed };
      }
    }
    throw new Error("could not build puzzle");
  }

  // ---------- menu ----------
  function renderMenu() {
    $("wsCats").innerHTML = Object.entries(CATEGORIES).map(([id, c]) => {
      const best = store.get(bestKey(id, level));
      return `<button class="ws-cat" type="button" data-cat="${id}"><span class="ws-cat-emoji">${c.emoji}</span><span class="ws-cat-name">${c.name}</span><span class="ws-cat-meta">${best ? "Best " + fmt(+best) : "Not played yet"}</span></button>`;
    }).join("");
    document.querySelectorAll("#wsLevels [data-level]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.level === level)));
  }

  function show(view) {
    $("wsMenu").hidden = view !== "menu";
    $("wsGame").hidden = view !== "game";
    window.scrollTo({ top: 0 });
  }

  // ---------- game ----------
  function start(catId) {
    stopTimer();
    $("wsWin").hidden = true;
    const { size, grid, words } = build(catId, level);
    game = { cat: catId, level, size, grid, words, elapsed: 0, last: Date.now(), hints: 0, timer: null, done: false };

    const stage = $("wsStage");
    stage.style.setProperty("--n", size);
    $("wsGrid").innerHTML = grid.map((row) => row.map((ch) => `<span>${ch}</span>`).join("")).join("");
    const svg = $("wsSvg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.innerHTML = '<g id="wsFound"></g><g id="wsSel"></g><g id="wsHint"></g>';

    $("wsTitle").textContent = `${CATEGORIES[catId].emoji} ${CATEGORIES[catId].name}`;
    $("wsLevelTag").textContent = LEVELS[level].label;
    $("wsList").innerHTML = words.map((w) => `<li data-w="${w.word}"><i style="--c:${w.color}"></i><span>${w.word}</span></li>`).join("");
    $("wsTimer").textContent = "00:00";
    updateProgress();
    game.timer = setInterval(tick, 250);
    show("game");
  }

  function tick() {
    const now = Date.now();
    if (!document.hidden) game.elapsed += now - game.last;
    game.last = now;
    $("wsTimer").textContent = fmt(Math.floor(game.elapsed / 1000));
  }

  function stopTimer() { if (game) clearInterval(game.timer); }

  function updateProgress() {
    const found = game.words.filter((w) => w.found).length;
    $("wsCount").textContent = `${found} / ${game.words.length}`;
    $("wsBar").style.width = (found / game.words.length) * 100 + "%";
  }

  function capsule(cells, cls, color) {
    const [r0, c0] = cells[0], [r1, c1] = cells[cells.length - 1];
    const l = document.createElementNS(SVGNS, "line");
    l.setAttribute("x1", c0 + 0.5); l.setAttribute("y1", r0 + 0.5);
    l.setAttribute("x2", c1 + 0.5); l.setAttribute("y2", r1 + 0.5);
    l.setAttribute("class", cls);
    if (color) l.style.stroke = color;
    return l;
  }

  function setSelection(cells) {
    const g = $("wsSel");
    g.replaceChildren();
    if (cells) g.appendChild(capsule(cells, "ws-cap ws-cap-sel"));
  }

  // ---------- pointer input ----------
  let drag = null;

  function cellFromEvent(e) {
    const rect = $("wsGrid").getBoundingClientRect();
    const n = game.size;
    const c = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * n)));
    const r = Math.min(n - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * n)));
    return [r, c];
  }

  // Snap the drag to the nearest of the 8 directions so slightly wobbly drags still select a straight line.
  function snapLine(r0, c0, r1, c1) {
    const dy = r1 - r0, dx = c1 - c0;
    if (!dx && !dy) return [[r0, c0]];
    const step = Math.PI / 4;
    const a = Math.round(Math.atan2(dy, dx) / step) * step;
    const sx = Math.round(Math.cos(a)), sy = Math.round(Math.sin(a));
    let len = Math.round((dx * sx + dy * sy) / (sx * sx + sy * sy));
    const n = game.size;
    while (len > 0 && (r0 + sy * len < 0 || r0 + sy * len >= n || c0 + sx * len < 0 || c0 + sx * len >= n)) len--;
    return Array.from({ length: len + 1 }, (_, i) => [r0 + sy * i, c0 + sx * i]);
  }

  function onDown(e) {
    if (!game || game.done || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    clearHint();
    const [r, c] = cellFromEvent(e);
    drag = { r, c, cells: [[r, c]] };
    sfx.start();
    $("wsStage").setPointerCapture(e.pointerId);
    setSelection(drag.cells);
  }

  function onMove(e) {
    if (!drag) return;
    const [r, c] = cellFromEvent(e);
    const cells = snapLine(drag.r, drag.c, r, c);
    if (cells.length !== drag.cells.length) sfx.step(cells.length);
    drag.cells = cells;
    setSelection(cells);
  }

  function onUp() {
    if (!drag) return;
    const cells = drag.cells;
    drag = null;
    setSelection(null);
    if (cells.length < 2) return;
    const text = cells.map(([r, c]) => game.grid[r][c]).join("");
    const rev = [...text].reverse().join("");
    const hit = game.words.find((w) => !w.found && (w.word === text || w.word === rev));
    if (hit) markFound(hit);
    else { flashMiss(); sfx.miss(); }
  }

  function flashMiss() {
    const s = $("wsStage");
    s.classList.remove("ws-miss");
    void s.offsetWidth;
    s.classList.add("ws-miss");
  }

  function markFound(w) {
    w.found = true;
    $("wsFound").appendChild(capsule(w.cells, "ws-cap ws-cap-found", w.color));
    document.querySelector(`#wsList [data-w="${w.word}"]`).classList.add("done");
    updateProgress();
    if (game.words.every((x) => x.found)) finish();
    else sfx.found();
  }

  // ---------- hint ----------
  let hintTimer = null;
  function clearHint() { clearTimeout(hintTimer); $("wsHint").replaceChildren(); }

  function hint() {
    if (!game || game.done) return;
    const left = game.words.filter((w) => !w.found);
    if (!left.length) return;
    clearHint();
    const w = left[rand(left.length)];
    const [r, c] = w.cells[0];
    const ring = document.createElementNS(SVGNS, "circle");
    ring.setAttribute("cx", c + 0.5); ring.setAttribute("cy", r + 0.5); ring.setAttribute("r", 0.46);
    ring.setAttribute("class", "ws-ring");
    $("wsHint").appendChild(ring);
    game.hints++;
    sfx.hint();
    hintTimer = setTimeout(clearHint, 3000);
  }

  // ---------- finish ----------
  function finish() {
    game.done = true;
    stopTimer();
    const secs = Math.floor(game.elapsed / 1000);
    const key = bestKey(game.cat, game.level);
    const prev = +store.get(key) || 0;
    const isBest = !prev || secs < prev;
    if (isBest) store.set(key, String(secs));
    $("wsWinTime").textContent = fmt(secs);
    $("wsWinHints").textContent = String(game.hints);
    $("wsWinBest").textContent = fmt(isBest ? secs : prev);
    $("wsWinSub").textContent = `${CATEGORIES[game.cat].name} · ${LEVELS[game.level].label}` + (isBest ? " · New best time!" : "");
    confetti();
    sfx.win();
    setTimeout(() => { $("wsWin").hidden = false; $("wsAgain").focus(); }, 450);
  }

  function confetti() {
    const box = $("wsConfetti");
    box.replaceChildren();
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.style.cssText = `left:${rand(100)}%;background:${COLORS[rand(COLORS.length)]};animation-delay:${(Math.random() * 0.6).toFixed(2)}s;animation-duration:${(1.6 + Math.random() * 1.4).toFixed(2)}s;transform:rotate(${rand(360)}deg)`;
      box.appendChild(p);
    }
  }

  function share() {
    const text = `I solved Word Search (${CATEGORIES[game.cat].name}, ${LEVELS[game.level].label}) in ${$("wsWinTime").textContent}! Can you beat it?`;
    const url = location.href;
    if (navigator.share) { navigator.share({ text, url }).catch(() => {}); return; }
    const done = () => { $("wsShare").textContent = "Copied!"; setTimeout(() => { $("wsShare").textContent = "Share result"; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(`${text} ${url}`).then(done, () => {});
  }

  // ---------- wiring ----------
  const stage = $("wsStage");
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);

  $("wsCats").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (b) start(b.dataset.cat);
  });
  $("wsLevels").addEventListener("click", (e) => {
    const b = e.target.closest("[data-level]");
    if (!b) return;
    level = b.dataset.level;
    store.set("ws-level", level);
    renderMenu();
  });
  const toMenu = () => { stopTimer(); $("wsWin").hidden = true; renderMenu(); show("menu"); };
  $("wsBack").addEventListener("click", toMenu);
  $("wsOther").addEventListener("click", toMenu);
  $("wsNew").addEventListener("click", () => start(game.cat));
  $("wsAgain").addEventListener("click", () => start(game.cat));
  $("wsHintBtn").addEventListener("click", hint);
  $("wsShare").addEventListener("click", share);
  const soundBtn = $("wsSound");
  const paintSound = () => {
    soundBtn.textContent = muted ? "🔇" : "🔊";
    soundBtn.setAttribute("aria-label", muted ? "Unmute sounds" : "Mute sounds");
    soundBtn.setAttribute("aria-pressed", String(muted));
  };
  soundBtn.addEventListener("click", () => { muted = !muted; store.set("ws-muted", muted ? "1" : "0"); paintSound(); if (!muted) sfx.start(); });
  paintSound();
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("wsWin").hidden) $("wsWin").hidden = true; });

  renderMenu();
})();

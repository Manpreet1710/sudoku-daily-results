(() => {
  const data = JSON.parse(document.getElementById("pipsData").textContent);
  const $ = (id) => document.getElementById(id);
  const SVGNS = "http://www.w3.org/2000/svg";
  const LEVELS = ["easy", "medium", "hard"];
  const COLORS = ["#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6", "#0ea5e9", "#f97316", "#84cc16", "#6366f1", "#d97706", "#22c55e", "#06b6d4", "#e11d48"];
  const NEUTRAL = "#94a3b8";
  const PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  const S = 64; // cell size
  const PAD = 18; // room for the corner labels

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  let level = LEVELS.includes(store.get("pips-level")) ? store.get("pips-level") : "easy";
  const placed = { easy: new Set(), medium: new Set(), hard: new Set() };
  const geo = {};

  const label = (r) =>
    r.type === "sum" ? String(r.target)
    : r.type === "greater" ? ">" + r.target
    : r.type === "less" ? "<" + r.target
    : r.type === "equals" ? "="
    : r.type === "unequal" ? "≠"
    : "";

  function geometry(d) {
    if (geo[d]) return geo[d];
    const p = data[d];
    const key = (c) => c[0] + "," + c[1];
    const regionOf = new Map();
    let ci = 0;
    const colors = p.regions.map((r, i) => {
      r.indices.forEach((c) => regionOf.set(key(c), i));
      return r.type === "empty" ? NEUTRAL : COLORS[ci++ % COLORS.length];
    });
    const dominoAt = new Map();
    p.solution.forEach((pair, i) => pair.forEach((c) => dominoAt.set(key(c), i)));
    const all = p.regions.flatMap((r) => r.indices);
    const rows = Math.max(...all.map((c) => c[0])) + 1;
    const cols = Math.max(...all.map((c) => c[1])) + 1;
    return (geo[d] = { p, key, regionOf, colors, dominoAt, rows, cols });
  }

  const dots = (value, x, y, size, cls) =>
    PIPS[value].map((i) => `<circle class="${cls}" cx="${(x + size * (0.27 + 0.23 * (i % 3))).toFixed(1)}" cy="${(y + size * (0.27 + 0.23 * Math.floor(i / 3))).toFixed(1)}" r="${(size * 0.08).toFixed(1)}"/>`).join("");

  function boardMarkup(d) {
    const { p, key, regionOf, colors, rows, cols } = geometry(d);
    const W = cols * S + PAD * 2, H = rows * S + PAD * 2;
    const at = (c) => ({ x: PAD + c[1] * S, y: PAD + c[0] * S });
    let cells = "", edges = "", tiles = "", marks = "";

    p.regions.forEach((r, i) => {
      r.indices.forEach((c) => {
        const { x, y } = at(c);
        cells += `<rect x="${x + 1}" y="${y + 1}" width="${S - 2}" height="${S - 2}" rx="7" style="fill:${colors[i]};fill-opacity:.34"/>`;
        const same = (dr, dc) => regionOf.get(key([c[0] + dr, c[1] + dc])) === i;
        const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${colors[i]}"/>`;
        if (!same(-1, 0)) edges += line(x + 4, y + 4, x + S - 4, y + 4);
        if (!same(1, 0)) edges += line(x + 4, y + S - 4, x + S - 4, y + S - 4);
        if (!same(0, -1)) edges += line(x + 4, y + 4, x + 4, y + S - 4);
        if (!same(0, 1)) edges += line(x + S - 4, y + 4, x + S - 4, y + S - 4);
      });
      const text = label(r);
      if (text) {
        const last = [...r.indices].sort((a, b) => a[0] - b[0] || a[1] - b[1]).pop();
        const cx = at(last).x + S - 4, cy = at(last).y + S - 4;
        marks += `<g class="pp-mark"><rect x="${cx - 13}" y="${cy - 13}" width="26" height="26" rx="5" transform="rotate(45 ${cx} ${cy})" style="fill:${colors[i]}"/><text x="${cx}" y="${cy + 0.5}">${text}</text></g>`;
      }
    });

    placed[d].forEach((i) => {
      const [a, b] = p.solution[i];
      const A = at(a), B = at(b);
      const x = Math.min(A.x, B.x) + 2, y = Math.min(A.y, B.y) + 2;
      const horizontal = a[0] === b[0];
      const w = (horizontal ? 2 * S : S) - 4, h = (horizontal ? S : 2 * S) - 4;
      const split = horizontal
        ? `<line class="pp-split" x1="${x + w / 2}" y1="${y + 6}" x2="${x + w / 2}" y2="${y + h - 6}"/>`
        : `<line class="pp-split" x1="${x + 6}" y1="${y + h / 2}" x2="${x + w - 6}" y2="${y + h / 2}"/>`;
      tiles += `<g class="pp-placed"><rect class="pp-tile" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>${split}${dots(p.dominoes[i][0], A.x, A.y, S, "pp-dot")}${dots(p.dominoes[i][1], B.x, B.y, S, "pp-dot")}</g>`;
    });

    return { W, H, html: `${cells}<g class="pp-edges">${edges}</g>${tiles}${marks}` };
  }

  function drawBoard() {
    const { W, H, html } = boardMarkup(level);
    const svg = $("pipsSvg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.maxWidth = W * 1.15 + "px";
    svg.innerHTML = html;
  }

  function drawDominoes() {
    const p = data[level];
    $("pipsDominoes").innerHTML = p.dominoes.map(([a, b], i) => {
      const used = placed[level].has(i);
      return `<button type="button" class="pp-dom${used ? " used" : ""}" data-i="${i}" aria-label="Domino ${a} and ${b}${used ? " (placed)" : ""}">` +
        `<svg viewBox="0 0 124 64"><rect class="pp-dtile" x="2" y="2" width="120" height="60" rx="9"/><line class="pp-dsplit" x1="62" y1="10" x2="62" y2="54"/>` +
        `${dots(a, 2, 2, 60, "pp-ddot")}${dots(b, 62, 2, 60, "pp-ddot")}</svg></button>`;
    }).join("");
  }

  function update() {
    const p = data[level];
    drawBoard();
    drawDominoes();
    const n = placed[level].size;
    $("pipsCount").textContent = `${n} / ${p.dominoes.length} placed`;
    $("pipsMeta").textContent = `Puzzle #${p.id}` + (p.constructors ? ` · by ${p.constructors}` : "");
    $("pipsDone").hidden = n !== p.dominoes.length;
    document.querySelectorAll("#pipsTabs [data-level]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.level === level)));
  }

  const toggle = (i) => {
    const s = placed[level];
    if (s.has(i)) s.delete(i); else s.add(i);
    update();
  };

  $("pipsDominoes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (b) toggle(+b.dataset.i);
  });

  $("pipsSvg").addEventListener("click", (e) => {
    const svg = $("pipsSvg");
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const x = ((e.clientX - rect.left) / rect.width) * vb.width - PAD;
    const y = ((e.clientY - rect.top) / rect.height) * vb.height - PAD;
    const { dominoAt, key } = geometry(level);
    const i = dominoAt.get(key([Math.floor(y / S), Math.floor(x / S)]));
    if (i !== undefined) toggle(i);
  });

  $("pipsTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-level]");
    if (!b) return;
    level = b.dataset.level;
    store.set("pips-level", level);
    update();
  });

  $("pipsHint").addEventListener("click", () => {
    const left = data[level].dominoes.map((_, i) => i).filter((i) => !placed[level].has(i));
    if (left.length) toggle(left[Math.floor(Math.random() * left.length)]);
  });
  $("pipsSolve").addEventListener("click", () => { data[level].dominoes.forEach((_, i) => placed[level].add(i)); update(); });
  $("pipsReset").addEventListener("click", () => { placed[level].clear(); update(); });

  update();
})();

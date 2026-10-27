// Logic solver for Tango (6x6): fill the grid with suns and moons so every row and column
// has three of each, no three identical symbols are adjacent, and every "=" / "x" sign between
// two cells holds (same / different). Each deduction is recorded as a readable step;
// backtracking is only a last resort.

export interface TangoStep {
  text: string;
  cells: [index: number, symbol: "O" | "X"][]; // cells this step fills; index = row * 6 + col
}

export interface TangoSolution {
  solution: string; // 36 chars of "O" / "X", empty if unsolvable
  steps: TangoStep[];
  logical: boolean; // solved by deduction alone, no guessing
  level: 1 | 2 | 3; // hardest technique needed: 1 basic rules, 2 line analysis, 3 trial
  unique: boolean;
}

const N = 6;
const SUN = 1;
const MOON = 2;
const opp = (v: number) => 3 - v;
const sym = (v: number) => (v === SUN ? "sun" : "moon");
const cellName = (i: number) => `row ${Math.floor(i / N) + 1}, column ${(i % N) + 1}`;

interface Edges {
  right: string[];
  bottom: string[];
}

function parse(board: string) {
  const v: number[] = [...board.slice(0, 36)].map((ch) => (ch === "O" ? SUN : ch === "X" ? MOON : 0));
  const edges: Edges = { right: [...board.slice(36, 72)], bottom: [...board.slice(72, 108)] };
  return { v, edges };
}

const edgeBetween = (e: Edges, a: number, b: number) => {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi === lo + 1 && lo % N < N - 1) return e.right[lo];
  if (hi === lo + N) return e.bottom[lo];
  return ".";
};

const neighbors = (i: number) => {
  const out: number[] = [];
  if (i % N > 0) out.push(i - 1);
  if (i % N < N - 1) out.push(i + 1);
  if (i >= N) out.push(i - N);
  if (i < N * (N - 1)) out.push(i + N);
  return out;
};

// kind 0 = row, 1 = column
const lineCells = (kind: 0 | 1, k: number) => Array.from({ length: N }, (_, t) => (kind === 0 ? k * N + t : t * N + k));
const lineName = (kind: 0 | 1, k: number) => `${kind === 0 ? "Row" : "Column"} ${k + 1}`;

// Every way to fill a line that is consistent with the cells already known
const BALANCED = Array.from({ length: 1 << N }, (_, m) => m).filter((m) => {
  let c = 0;
  for (let t = 0; t < N; t++) c += (m >> t) & 1;
  return c === N / 2;
});

function linePatterns(v: number[], e: Edges, kind: 0 | 1, k: number): number[][] {
  const idx = lineCells(kind, k);
  const out: number[][] = [];
  for (const m of BALANCED) {
    const p = idx.map((_, t) => (((m >> t) & 1) ? SUN : MOON));
    let ok = true;
    for (let t = 0; t < N && ok; t++) {
      if (v[idx[t]] && v[idx[t]] !== p[t]) ok = false;
      else if (t >= 2 && p[t] === p[t - 1] && p[t] === p[t - 2]) ok = false;
      else if (t >= 1) {
        const s = edgeBetween(e, idx[t - 1], idx[t]);
        if ((s === "=" && p[t] !== p[t - 1]) || (s === "x" && p[t] === p[t - 1])) ok = false;
      }
    }
    if (ok) out.push(p);
  }
  return out;
}

interface Move {
  text: string;
  cells: [number, number][]; // [index, value]
}

// Tier 1: the basic rules, one cell at a time
function basicMove(v: number[], e: Edges): Move | null {
  for (let i = 0; i < N * N; i++) {
    if (v[i]) continue;
    const r = Math.floor(i / N), c = i % N;

    for (const j of neighbors(i)) {
      const s = edgeBetween(e, i, j);
      if (s === "." || !v[j]) continue;
      const val = s === "=" ? v[j] : opp(v[j]);
      return { cells: [[i, val]], text: `The "${s === "=" ? "=" : "×"}" sign says ${cellName(i)} and ${cellName(j)} ${s === "=" ? "match" : "differ"}, and ${cellName(j)} is a ${sym(v[j])}, so ${cellName(i)} is a ${sym(val)}.` };
    }

    for (const [d, inLine] of [[1, (k: number) => c + k >= 0 && c + k < N], [N, (k: number) => r + k >= 0 && r + k < N]] as const) {
      for (const [a, b] of [[1, 2], [-2, -1], [-1, 1]]) {
        if (!inLine(a) || !inLine(b)) continue;
        const x = v[i + a * d], y = v[i + b * d];
        if (!x || x !== y) continue;
        const why = a === -1 && b === 1
          ? `${cellName(i)} sits between two ${sym(x)}s, and a ${sym(x)} here would make three in a row`
          : `${cellName(i + a * d)} and ${cellName(i + b * d)} are both ${sym(x)}s, and a third ${sym(x)} next to them would make three in a row`;
        return { cells: [[i, opp(x)]], text: `${why}, so ${cellName(i)} is a ${sym(opp(x))}.` };
      }
    }

    for (const kind of [0, 1] as const) {
      const k = kind === 0 ? r : c;
      for (const s of [SUN, MOON]) {
        if (lineCells(kind, k).filter((j) => v[j] === s).length === N / 2) {
          return { cells: [[i, opp(s)]], text: `${lineName(kind, k)} already has three ${sym(s)}s, so ${cellName(i)} is a ${sym(opp(s))}.` };
        }
      }
    }
  }
  return null;
}

// Tier 2: a cell that holds the same symbol in every valid way to fill its line is forced
function lineMove(v: number[], e: Edges): Move | "dead" | null {
  for (const kind of [0, 1] as const)
    for (let k = 0; k < N; k++) {
      const pats = linePatterns(v, e, kind, k);
      if (pats.length === 0) return "dead";
      const idx = lineCells(kind, k);
      const forced: [number, number][] = [];
      idx.forEach((cell, t) => {
        if (!v[cell] && pats.every((p) => p[t] === pats[0][t])) forced.push([cell, pats[0][t]]);
      });
      if (!forced.length) continue;
      const parts = forced.map(([cell, val]) => `${kind === 0 ? "column" : "row"} ${(kind === 0 ? cell % N : Math.floor(cell / N)) + 1} is a ${sym(val)}`);
      const ways = pats.length === 1 ? "only one way left to be completed" : `only ${pats.length} ways left to be completed that follow every rule`;
      return { cells: forced, text: `${lineName(kind, k)} has ${ways}${pats.length === 1 ? "" : `, and in every one of them ${parts.join(", ")}`}.` };
    }
  return null;
}

// Silent propagation used by trial; true means the position is contradictory
function contradicts(v: number[], e: Edges): boolean {
  for (;;) {
    const b = basicMove(v, e);
    if (b) {
      for (const [i, val] of b.cells) v[i] = val;
      continue;
    }
    const l = lineMove(v, e);
    if (l === "dead") return true;
    if (l) {
      for (const [i, val] of l.cells) v[i] = val;
      continue;
    }
    // Everything filled: make sure no line is broken
    for (const kind of [0, 1] as const) for (let k = 0; k < N; k++) if (linePatterns(v, e, kind, k).length === 0) return true;
    return false;
  }
}

export function solveTango(board: string): TangoSolution {
  const { v, edges } = parse(board);
  const steps: TangoStep[] = [];
  let level: 1 | 2 | 3 = 1;
  const apply = (m: Move) => {
    for (const [i, val] of m.cells) v[i] = val;
    steps.push({ text: m.text[0].toUpperCase() + m.text.slice(1), cells: m.cells.map(([i, val]) => [i, val === SUN ? "O" : "X"]) });
  };

  while (v.includes(0)) {
    const b = basicMove(v, edges);
    if (b) { apply(b); continue; }
    const l = lineMove(v, edges);
    if (l === "dead") break;
    if (l) { apply(l); level = Math.max(level, 2) as 1 | 2 | 3; continue; }

    let trial: Move | null = null;
    for (let i = 0; i < N * N && !trial; i++) {
      if (v[i]) continue;
      for (const val of [SUN, MOON]) {
        const x = [...v];
        x[i] = val;
        if (contradicts(x, edges)) {
          trial = { cells: [[i, opp(val)]], text: `Trying a ${sym(val)} in ${cellName(i)} soon leads to a broken rule, so ${cellName(i)} must be a ${sym(opp(val))}.` };
          break;
        }
      }
    }
    if (!trial) break;
    apply(trial);
    level = 3;
  }

  const logical = !v.includes(0);
  const given = parse(board).v;
  let solved = v;
  if (!logical) {
    const found = search(v, edges, 1)[0];
    if (!found) return { solution: "", steps, logical: false, level, unique: false };
    steps.push({ text: "Logic alone gets stuck here, so the remaining cells are found by trial and error.", cells: [] });
    found.forEach((val, i) => {
      if (!v[i]) steps.push({ text: `${cellName(i)[0].toUpperCase() + cellName(i).slice(1)} is a ${sym(val)}.`, cells: [[i, val === SUN ? "O" : "X"]] });
    });
    solved = found;
  }
  const unique = search(given, edges, 2).length === 1;
  return { solution: solved.map((x) => (x === SUN ? "O" : "X")).join(""), steps, logical, level, unique };
}

// Cell-by-cell backtracking from a partly filled grid; returns up to `limit` solutions
function search(start: number[], e: Edges, limit: number): number[][] {
  const out: number[][] = [];
  const v = [...start];
  const ok = (i: number) => {
    const r = Math.floor(i / N), c = i % N, x = v[i];
    let row = 0, col = 0;
    for (let t = 0; t < N; t++) {
      if (v[r * N + t] === x) row++;
      if (v[t * N + c] === x) col++;
    }
    if (row > N / 2 || col > N / 2) return false;
    if (c >= 2 && v[i - 1] === x && v[i - 2] === x) return false;
    if (r >= 2 && v[i - N] === x && v[i - 2 * N] === x) return false;
    for (const j of [c > 0 ? i - 1 : -1, r > 0 ? i - N : -1]) {
      if (j < 0) continue;
      const s = edgeBetween(e, i, j);
      if ((s === "=" && v[j] !== x) || (s === "x" && v[j] === x)) return false;
    }
    return true;
  };
  const go = (i: number) => {
    if (i === N * N) {
      out.push([...v]);
      return;
    }
    const fixed = start[i];
    for (const x of fixed ? [fixed] : [SUN, MOON]) {
      if (out.length >= limit) return;
      v[i] = x;
      if (ok(i)) go(i + 1);
    }
    v[i] = fixed;
  };
  go(0);
  return out;
}

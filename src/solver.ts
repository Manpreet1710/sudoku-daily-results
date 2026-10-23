// Human-style Sudoku solver: applies logical techniques in order of difficulty,
// recording every step, and only falls back to backtracking when logic runs out.

export type Technique =
  | "Naked Single"
  | "Hidden Single"
  | "Pointing"
  | "Claiming"
  | "Naked Pair"
  | "Naked Triple"
  | "Hidden Pair"
  | "Hidden Triple"
  | "X-Wing"
  | "Backtracking";

export type Step =
  | { type: "place"; cell: number; digit: number; tech: Technique; why: string }
  | { type: "elim"; tech: Technique; removed: [number, number][]; why: string };

export type Rating = "Easy" | "Medium" | "Hard" | "Expert" | "Extreme";

export interface SolveResult {
  solved: boolean;
  solution: string;
  givens: number;
  steps: Step[];
  techniques: Partial<Record<Technique, number>>;
  rating: Rating;
  uniqueSolution: boolean;
  timeMs: number;
}

const TECH_RATING: Record<Technique, Rating> = {
  "Naked Single": "Easy",
  "Hidden Single": "Easy",
  Pointing: "Medium",
  Claiming: "Medium",
  "Naked Pair": "Hard",
  "Naked Triple": "Hard",
  "Hidden Pair": "Hard",
  "Hidden Triple": "Hard",
  "X-Wing": "Expert",
  Backtracking: "Extreme",
};
const RATING_ORDER: Rating[] = ["Easy", "Medium", "Hard", "Expert", "Extreme"];

const ALL = 0b1111111110; // bits 1..9

const rowOf = (i: number) => Math.floor(i / 9);
const colOf = (i: number) => i % 9;
const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

interface Unit {
  kind: "Row" | "Column" | "Box";
  n: number;
  cells: number[];
}

const ROWS: Unit[] = [];
const COLS: Unit[] = [];
const BOXES: Unit[] = [];
for (let n = 0; n < 9; n++) {
  ROWS.push({ kind: "Row", n, cells: [] });
  COLS.push({ kind: "Column", n, cells: [] });
  BOXES.push({ kind: "Box", n, cells: [] });
}
for (let i = 0; i < 81; i++) {
  ROWS[rowOf(i)].cells.push(i);
  COLS[colOf(i)].cells.push(i);
  BOXES[boxOf(i)].cells.push(i);
}
const UNITS = [...BOXES, ...ROWS, ...COLS];

const PEERS: number[][] = Array.from({ length: 81 }, (_, i) => {
  const s = new Set([...ROWS[rowOf(i)].cells, ...COLS[colOf(i)].cells, ...BOXES[boxOf(i)].cells]);
  s.delete(i);
  return [...s];
});

export const cellName = (i: number) => `R${rowOf(i) + 1}C${colOf(i) + 1}`;
const unitName = (u: Unit) => `${u.kind} ${u.n + 1}`;

const bit = (d: number) => 1 << d;
const popcount = (m: number) => {
  let c = 0;
  while (m) {
    m &= m - 1;
    c++;
  }
  return c;
};
const digitsOf = (m: number) => {
  const out: number[] = [];
  for (let d = 1; d <= 9; d++) if (m & bit(d)) out.push(d);
  return out;
};

function combinations<T>(arr: T[], k: number): T[][] {
  const out: T[][] = [];
  const pick = (start: number, acc: T[]) => {
    if (acc.length === k) return void out.push(acc.slice());
    for (let i = start; i < arr.length; i++) {
      acc.push(arr[i]);
      pick(i + 1, acc);
      acc.pop();
    }
  };
  pick(0, []);
  return out;
}

export function parsePuzzle(s: string): number[] {
  const clean = s.replace(/[^0-9.]/g, "").replace(/\./g, "0");
  if (clean.length !== 81) throw new Error(`Puzzle must have 81 cells, got ${clean.length}`);
  return [...clean].map(Number);
}

class Board {
  values: number[];
  cand: number[];
  steps: Step[] = [];

  constructor(values: number[]) {
    this.values = values.slice();
    this.cand = new Array(81).fill(0);
    for (let i = 0; i < 81; i++) {
      if (this.values[i]) continue;
      let m = ALL;
      for (const p of PEERS[i]) if (this.values[p]) m &= ~bit(this.values[p]);
      this.cand[i] = m;
    }
  }

  place(cell: number, digit: number, tech: Technique, why: string) {
    this.values[cell] = digit;
    this.cand[cell] = 0;
    for (const p of PEERS[cell]) this.cand[p] &= ~bit(digit);
    this.steps.push({ type: "place", cell, digit, tech, why });
  }

  eliminate(removed: [number, number][], tech: Technique, why: string): boolean {
    const actual = removed.filter(([c, d]) => this.cand[c] & bit(d));
    if (!actual.length) return false;
    for (const [c, d] of actual) this.cand[c] &= ~bit(d);
    this.steps.push({ type: "elim", tech, removed: actual, why });
    return true;
  }

  isSolved() {
    return this.values.every((v) => v !== 0);
  }

  isBroken() {
    return this.values.some((v, i) => v === 0 && this.cand[i] === 0);
  }

  // --- Techniques: each returns true if it made progress ---

  nakedSingle(): boolean {
    for (let i = 0; i < 81; i++) {
      if (!this.values[i] && popcount(this.cand[i]) === 1) {
        const d = digitsOf(this.cand[i])[0];
        this.place(i, d, "Naked Single", `${cellName(i)} has only one candidate left: ${d}`);
        return true;
      }
    }
    return false;
  }

  hiddenSingle(): boolean {
    for (const u of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const spots = u.cells.filter((c) => this.cand[c] & bit(d));
        if (spots.length === 1) {
          this.place(spots[0], d, "Hidden Single", `${d} can only go in ${cellName(spots[0])} within ${unitName(u)}`);
          return true;
        }
      }
    }
    return false;
  }

  lockedCandidates(): boolean {
    // Pointing: a digit confined to one row/column inside a box
    for (const box of BOXES) {
      for (let d = 1; d <= 9; d++) {
        const spots = box.cells.filter((c) => this.cand[c] & bit(d));
        if (spots.length < 2) continue;
        for (const [lines, lineOf] of [
          [ROWS, rowOf],
          [COLS, colOf],
        ] as const) {
          const l = lineOf(spots[0]);
          if (!spots.every((c) => lineOf(c) === l)) continue;
          const removed = lines[l].cells
            .filter((c) => boxOf(c) !== box.n)
            .map((c) => [c, d] as [number, number]);
          const why = `In ${unitName(box)}, ${d} is confined to ${unitName(lines[l])}, so remove it from the rest of that line`;
          if (this.eliminate(removed, "Pointing", why)) return true;
        }
      }
    }
    // Claiming: a digit in a row/column confined to one box
    for (const line of [...ROWS, ...COLS]) {
      for (let d = 1; d <= 9; d++) {
        const spots = line.cells.filter((c) => this.cand[c] & bit(d));
        if (spots.length < 2) continue;
        const b = boxOf(spots[0]);
        if (!spots.every((c) => boxOf(c) === b)) continue;
        const removed = BOXES[b].cells
          .filter((c) => !line.cells.includes(c))
          .map((c) => [c, d] as [number, number]);
        const why = `In ${unitName(line)}, ${d} is confined to Box ${b + 1}, so remove it from the rest of that box`;
        if (this.eliminate(removed, "Claiming", why)) return true;
      }
    }
    return false;
  }

  nakedSubset(k: 2 | 3): boolean {
    const tech: Technique = k === 2 ? "Naked Pair" : "Naked Triple";
    for (const u of UNITS) {
      const open = u.cells.filter((c) => !this.values[c] && popcount(this.cand[c]) <= k);
      for (const combo of combinations(open, k)) {
        const union = combo.reduce((m, c) => m | this.cand[c], 0);
        if (popcount(union) !== k) continue;
        const ds = digitsOf(union);
        const removed: [number, number][] = [];
        for (const c of u.cells) {
          if (this.values[c] || combo.includes(c)) continue;
          for (const d of ds) removed.push([c, d]);
        }
        const why = `${combo.map(cellName).join(", ")} in ${unitName(u)} hold only {${ds.join(",")}}`;
        if (this.eliminate(removed, tech, why)) return true;
      }
    }
    return false;
  }

  hiddenSubset(k: 2 | 3): boolean {
    const tech: Technique = k === 2 ? "Hidden Pair" : "Hidden Triple";
    for (const u of UNITS) {
      const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => u.cells.some((c) => this.cand[c] & bit(d)));
      for (const ds of combinations(missing, k)) {
        const mask = ds.reduce((m, d) => m | bit(d), 0);
        const cells = u.cells.filter((c) => this.cand[c] & mask);
        if (cells.length !== k) continue;
        const removed: [number, number][] = [];
        for (const c of cells) for (const d of digitsOf(this.cand[c] & ~mask)) removed.push([c, d]);
        const why = `{${ds.join(",")}} appear only in ${cells.map(cellName).join(", ")} within ${unitName(u)}`;
        if (this.eliminate(removed, tech, why)) return true;
      }
    }
    return false;
  }

  xWing(): boolean {
    for (let d = 1; d <= 9; d++) {
      for (const [bases, covers, posOf, baseName] of [
        [ROWS, COLS, colOf, "rows"],
        [COLS, ROWS, rowOf, "columns"],
      ] as const) {
        const pairs = bases
          .map((u) => ({ u, pos: u.cells.filter((c) => this.cand[c] & bit(d)).map(posOf) }))
          .filter((x) => x.pos.length === 2);
        for (const [a, b] of combinations(pairs, 2)) {
          if (a.pos[0] !== b.pos[0] || a.pos[1] !== b.pos[1]) continue;
          const removed: [number, number][] = [];
          for (const p of a.pos)
            for (const c of covers[p].cells)
              if (!a.u.cells.includes(c) && !b.u.cells.includes(c)) removed.push([c, d]);
          const why = `${d} forms an X-Wing on ${baseName} ${a.u.n + 1} & ${b.u.n + 1}`;
          if (this.eliminate(removed, "X-Wing", why)) return true;
        }
      }
    }
    return false;
  }
}

// Backtracking with minimum-remaining-values; counts up to `limit` solutions.
function backtrack(values: number[], limit: number): { count: number; first: number[] | null } {
  const v = values.slice();
  let count = 0;
  let first: number[] | null = null;

  const candidates = (i: number) => {
    let m = ALL;
    for (const p of PEERS[i]) if (v[p]) m &= ~bit(v[p]);
    return m;
  };

  const go = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (v[i]) continue;
      const m = candidates(i);
      const n = popcount(m);
      if (n === 0) return false;
      if (n < bestCount) {
        best = i;
        bestMask = m;
        bestCount = n;
        if (n === 1) break;
      }
    }
    if (best === -1) {
      count++;
      if (!first) first = v.slice();
      return count >= limit;
    }
    for (const d of digitsOf(bestMask)) {
      v[best] = d;
      if (go()) return true;
    }
    v[best] = 0;
    return false;
  };

  go();
  return { count, first };
}

export function solve(puzzle: string): SolveResult {
  const t0 = performance.now();
  const start = parsePuzzle(puzzle);
  const board = new Board(start);

  const techniques: (() => boolean)[] = [
    () => board.hiddenSingle(),
    () => board.nakedSingle(),
    () => board.lockedCandidates(),
    () => board.nakedSubset(2),
    () => board.hiddenSubset(2),
    () => board.nakedSubset(3),
    () => board.hiddenSubset(3),
    () => board.xWing(),
  ];

  while (!board.isSolved() && !board.isBroken()) {
    if (!techniques.some((t) => t())) break;
  }

  const { count, first } = backtrack(start, 2);

  // Logic got stuck: finish the remaining cells from the backtracking solution.
  if (!board.isSolved() && first) {
    const sol = first as number[];
    for (let i = 0; i < 81; i++) {
      if (!board.values[i]) board.place(i, sol[i], "Backtracking", `Logic exhausted; ${cellName(i)} = ${sol[i]} found by search`);
    }
  }

  const used: Partial<Record<Technique, number>> = {};
  for (const s of board.steps) used[s.tech] = (used[s.tech] ?? 0) + 1;
  const rating = (Object.keys(used) as Technique[])
    .map((t) => TECH_RATING[t])
    .reduce<Rating>((a, b) => (RATING_ORDER.indexOf(b) > RATING_ORDER.indexOf(a) ? b : a), "Easy");

  return {
    solved: board.isSolved(),
    solution: board.values.join(""),
    givens: start.filter(Boolean).length,
    steps: board.steps,
    techniques: used,
    rating,
    uniqueSolution: count === 1,
    timeMs: Math.round((performance.now() - t0) * 100) / 100,
  };
}

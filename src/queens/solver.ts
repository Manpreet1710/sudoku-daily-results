// Logic solver for Queens: one queen per row, column and color region, and no two
// queens touching (diagonals included). It applies human-style deductions and
// records each as a readable step; backtracking is only a last resort.

export interface QueensStep {
  text: string;
  queen?: [row: number, col: number]; // set when the step places a queen (0-based)
}

export interface QueensSolution {
  queens: [number, number][]; // one per row, 0-based
  steps: QueensStep[];
  logical: boolean; // solved by deduction alone, no guessing
  level: 1 | 2 | 3 | 4; // hardest technique needed: 1 singles, 2 line, 3 multi-unit, 4 trial
  unique: boolean;
}

type Kind = 0 | 1 | 2; // region, row, column
const KINDS: Kind[] = [0, 1, 2];

class Board {
  cand: boolean[][];
  queens: [number, number][] = [];

  constructor(readonly grid: number[][]) {
    this.n = grid.length;
    this.cand = grid.map((row) => row.map(() => true));
  }
  readonly n: number;

  clone() {
    const b = new Board(this.grid);
    b.cand = this.cand.map((row) => [...row]);
    b.queens = [...this.queens];
    return b;
  }

  unitOf(kind: Kind, r: number, c: number) {
    return kind === 0 ? this.grid[r][c] : kind === 1 ? r : c;
  }

  cells(kind: Kind, u: number): [number, number][] {
    const out: [number, number][] = [];
    for (let r = 0; r < this.n; r++) for (let c = 0; c < this.n; c++) if (this.unitOf(kind, r, c) === u) out.push([r, c]);
    return out;
  }

  cands(kind: Kind, u: number) {
    return this.cells(kind, u).filter(([r, c]) => this.cand[r][c]);
  }

  hasQueen(kind: Kind, u: number) {
    return this.queens.some(([r, c]) => this.unitOf(kind, r, c) === u);
  }

  place(qr: number, qc: number) {
    this.queens.push([qr, qc]);
    for (let r = 0; r < this.n; r++)
      for (let c = 0; c < this.n; c++) {
        const sees = r === qr || c === qc || this.grid[r][c] === this.grid[qr][qc] || (Math.abs(r - qr) <= 1 && Math.abs(c - qc) <= 1);
        if (sees && !(r === qr && c === qc)) this.cand[r][c] = false;
      }
  }
}

const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export function solveQueens(grid: number[][], colors: string[]): QueensSolution {
  const n = grid.length;
  const b = new Board(grid);
  const steps: QueensStep[] = [];
  let level: 1 | 2 | 3 | 4 = 1;

  const unitName = (kind: Kind, u: number, cap = false) => {
    const s = kind === 0 ? `the ${colors[u]} region` : kind === 1 ? `row ${u + 1}` : `column ${u + 1}`;
    return cap ? s[0].toUpperCase() + s.slice(1) : s;
  };
  const unitsName = (kind: Kind, us: number[]) =>
    kind === 0 ? `the ${list(us.map((u) => colors[u]))} region${us.length > 1 ? "s" : ""}` : `${kind === 1 ? "row" : "column"}${us.length > 1 ? "s" : ""} ${list(us.map((u) => String(u + 1)))}`;
  const cellName = (r: number, c: number) => `row ${r + 1}, column ${c + 1}`;

  const placeStep = (r: number, c: number, why: string) => {
    steps.push({ text: `${why} The queen goes in ${cellName(r, c)} (${colors[grid[r][c]]}).`, queen: [r, c] });
    b.place(r, c);
  };

  // Tier 1: a unit with a single candidate left must put its queen there
  const singles = () => {
    for (const kind of KINDS)
      for (let u = 0; u < n; u++) {
        if (b.hasQueen(kind, u)) continue;
        const cs = b.cands(kind, u);
        if (cs.length === 1) {
          placeStep(cs[0][0], cs[0][1], `${unitName(kind, u, true)} has only one possible cell left.`);
          return true;
        }
      }
    return false;
  };

  // Tiers 2-3: k units of one kind whose candidates sit inside exactly k units of
  // another kind use those up, so everything else in them is ruled out.
  const confine = (minSize: number, maxSize: number) => {
    for (let size = minSize; size <= maxSize; size++)
      for (const A of KINDS)
        for (const B of KINDS) {
          if (A === B) continue;
          for (let mask = 1; mask < 1 << n; mask++) {
            if (popcount(mask) !== size) continue;
            const S: number[] = [];
            for (let u = 0; u < n; u++) if (mask & (1 << u)) S.push(u);
            const T = new Set<number>();
            for (const u of S) for (const [r, c] of b.cands(A, u)) T.add(b.unitOf(B, r, c));
            if (T.size !== size) continue;
            let changed = 0;
            for (const t of T)
              for (const [r, c] of b.cells(B, t))
                if (b.cand[r][c] && !(mask & (1 << b.unitOf(A, r, c)))) {
                  b.cand[r][c] = false;
                  changed++;
                }
            if (changed) {
              const Tl = [...T].sort((x, y) => x - y);
              const one = size === 1;
              const text = `${unitsName(A, S)} can only have ${one ? "its queen" : "their queens"} inside ${unitsName(B, Tl)}, so ${one ? "that queen is" : "those queens are"} used up there: every other cell in ${one ? "it" : "them"} is ruled out.`;
              steps.push({ text: text[0].toUpperCase() + text.slice(1) });
              return true;
            }
          }
        }
    return false;
  };

  // Tier 4: if a queen in a cell leaves some unit with nowhere to go, that cell is out
  const deadUnit = (x: Board): string | null => {
    for (const kind of KINDS)
      for (let u = 0; u < n; u++) if (!x.hasQueen(kind, u) && x.cands(kind, u).length === 0) return unitName(kind, u);
    return null;
  };
  const trial = () => {
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (!b.cand[r][c] || b.queens.some(([qr, qc]) => qr === r && qc === c)) continue;
        const x = b.clone();
        x.place(r, c);
        let dead = deadUnit(x);
        while (!dead) {
          let moved = false;
          outer: for (const kind of KINDS)
            for (let u = 0; u < n; u++) {
              if (x.hasQueen(kind, u)) continue;
              const cs = x.cands(kind, u);
              if (cs.length === 1) {
                x.place(cs[0][0], cs[0][1]);
                moved = true;
                break outer;
              }
            }
          if (!moved) break;
          dead = deadUnit(x);
        }
        if (dead) {
          b.cand[r][c] = false;
          steps.push({ text: `A queen in ${cellName(r, c)} would force a chain of moves that leaves ${dead} with no place for its queen, so ${cellName(r, c)} cannot hold a queen.` });
          return true;
        }
      }
    return false;
  };

  while (b.queens.length < n) {
    if (singles()) continue;
    if (confine(1, 1)) { level = Math.max(level, 2) as 2; continue; }
    if (confine(2, n - 1)) { level = Math.max(level, 3) as 3; continue; }
    if (trial()) { level = 4; continue; }
    break;
  }

  let logical = b.queens.length === n;
  if (!logical) {
    // Deduction stalled: finish by search, starting from what is already known
    const found = search(grid, b.cand, 1)[0];
    if (!found) return { queens: [], steps, logical: false, level, unique: false };
    steps.push({ text: "Logic alone gets stuck here, so the remaining queens are found by trial and error." });
    const placed = new Set(b.queens.map(([r]) => r));
    found.forEach((c, r) => {
      if (!placed.has(r)) steps.push({ text: `Queen in ${cellName(r, c)} (${colors[grid[r][c]]}).`, queen: [r, c] });
    });
    b.queens = found.map((c, r) => [r, c] as [number, number]);
  }

  const queens = [...b.queens].sort((x, y) => x[0] - y[0]);
  const unique = search(grid, grid.map((row) => row.map(() => true)), 2).length === 1;
  return { queens, steps, logical, level, unique };
}

const popcount = (x: number) => {
  let c = 0;
  for (; x; x &= x - 1) c++;
  return c;
};

// Row-by-row backtracking; returns up to `limit` solutions as column-per-row arrays
function search(grid: number[][], cand: boolean[][], limit: number): number[][] {
  const n = grid.length;
  const out: number[][] = [];
  const cols = Array<number>(n).fill(-1);
  const usedCol = Array<boolean>(n).fill(false);
  const usedReg = Array<boolean>(n).fill(false);
  const go = (r: number) => {
    if (r === n) {
      out.push([...cols]);
      return;
    }
    for (let c = 0; c < n && out.length < limit; c++) {
      const g = grid[r][c];
      if (!cand[r][c] || usedCol[c] || usedReg[g] || (r > 0 && Math.abs(cols[r - 1] - c) <= 1)) continue;
      cols[r] = c;
      usedCol[c] = usedReg[g] = true;
      go(r + 1);
      usedCol[c] = usedReg[g] = false;
    }
  };
  go(0);
  return out;
}

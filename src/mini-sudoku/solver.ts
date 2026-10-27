// Solves a 6x6 Mini Sudoku (digits 1-6) with human-style steps. The six regions are usually 2 rows by 3 columns
// boxes but can be any six connected shapes, so they are passed in.
// Techniques, easiest first: Naked Single, Hidden Single, Naked Pair, Pointing, then a trial as the last resort.

export interface MiniSudokuStep {
  tech: string;
  cell?: number; // placed cell, for placements
  digit?: number;
  text: string;
}

export interface MiniSudokuSolution {
  solution: string; // 36 digits
  steps: MiniSudokuStep[];
  logical: boolean; // false when a trial was needed
  unique: boolean;
}

const N = 6;
const ALL = 0b111111; // bit d-1 set means digit d is still possible
const bit = (d: number) => 1 << (d - 1);
const digitsOf = (m: number) => [1, 2, 3, 4, 5, 6].filter((d) => m & bit(d));
const count = (m: number) => digitsOf(m).length;
const row = (i: number) => Math.floor(i / N);
const col = (i: number) => i % N;

export const cellName = (i: number) => `R${row(i) + 1}C${col(i) + 1}`;

// Region number (0-5) of each cell
export type Regions = number[];
export const BOX_REGIONS: Regions = Array.from({ length: 36 }, (_, i) => Math.floor(row(i) / 2) * 2 + Math.floor(col(i) / 3));

// Rows, columns and regions are the units that must each hold 1-6 once
function layoutOf(regions: Regions) {
  const units = [
    ...Array.from({ length: N }, (_, r) => ({ name: `row ${r + 1}`, cells: Array.from({ length: N }, (_, c) => r * N + c) })),
    ...Array.from({ length: N }, (_, c) => ({ name: `column ${c + 1}`, cells: Array.from({ length: N }, (_, r) => r * N + c) })),
    ...Array.from({ length: N }, (_, g) => ({ name: `region ${g + 1}`, cells: Array.from({ length: 36 }, (_, i) => i).filter((i) => regions[i] === g) })),
  ];
  const peers = Array.from({ length: 36 }, (_, i) =>
    Array.from({ length: 36 }, (_, j) => j).filter((j) => j !== i && (row(i) === row(j) || col(i) === col(j) || regions[i] === regions[j])),
  );
  return { units, peers };
}

// A valid layout has six regions of exactly six cells each
export const validRegions = (r: Regions) =>
  r.length === 36 && Array.from({ length: N }, (_, g) => r.filter((x) => x === g).length).every((n) => n === N);

// True when the clues break a rule on their own
export function hasConflict(puzzle: string, regions: Regions = BOX_REGIONS) {
  return layoutOf(regions).units.some((u) => {
    const seen = new Set<string>();
    return u.cells.some((c) => puzzle[c] !== "0" && (seen.has(puzzle[c]) || !seen.add(puzzle[c])));
  });
}

// Backtracking count of solutions (stops at `limit`), used for the uniqueness check and as a fallback
function search(vals: number[], limit: number, out: number[][], PEERS: number[][]): number {
  let best = -1, bestCount = 7;
  const cand = (i: number) => PEERS[i].reduce((m, p) => (vals[p] ? m & ~bit(vals[p]) : m), ALL);
  for (let i = 0; i < 36; i++) {
    if (vals[i]) continue;
    const c = count(cand(i));
    if (c < bestCount) { best = i; bestCount = c; }
    if (c === 0) return 0;
  }
  if (best < 0) { out.push([...vals]); return 1; }
  let found = 0;
  for (const d of digitsOf(cand(best))) {
    vals[best] = d;
    found += search(vals, limit - found, out, PEERS);
    vals[best] = 0;
    if (found >= limit) break;
  }
  return found;
}

export function solveMiniSudoku(puzzle: string, regions: Regions = BOX_REGIONS): MiniSudokuSolution | null {
  if (!/^[0-6]{36}$/.test(puzzle) || !validRegions(regions) || hasConflict(puzzle, regions)) return null;
  const { units: UNITS, peers: PEERS } = layoutOf(regions);
  const vals = [...puzzle].map(Number);

  const all: number[][] = [];
  const total = search([...vals], 2, all, PEERS);
  if (!total) return null;

  const cand = new Array<number>(36).fill(ALL);
  const steps: MiniSudokuStep[] = [];
  let logical = true;

  const place = (i: number, d: number, tech: string, text: string) => {
    vals[i] = d;
    cand[i] = 0;
    for (const p of PEERS[i]) cand[p] &= ~bit(d);
    steps.push({ tech, cell: i, digit: d, text: `${cellName(i)} = ${d}: ${text}` });
  };
  vals.forEach((d, i) => { if (d) { vals[i] = 0; place(i, d, "Given", ""); } });
  steps.length = 0;

  const eliminate = (cells: number[], digits: number[]) => {
    let changed = false;
    for (const c of cells) for (const d of digits) if (cand[c] & bit(d)) { cand[c] &= ~bit(d); changed = true; }
    return changed;
  };

  while (vals.some((v) => !v)) {
    let moved = false;

    // Naked Single: a cell with one candidate left
    for (let i = 0; i < 36 && !moved; i++)
      if (!vals[i] && count(cand[i]) === 1) {
        const d = digitsOf(cand[i])[0];
        place(i, d, "Naked Single", `every other digit already appears in its row, column or region.`);
        moved = true;
      }
    // Hidden Single: a digit with one possible cell in a row, column or region
    for (const u of UNITS) {
      if (moved) break;
      for (let d = 1; d <= N && !moved; d++) {
        if (u.cells.some((c) => vals[c] === d)) continue;
        const spots = u.cells.filter((c) => !vals[c] && cand[c] & bit(d));
        if (spots.length === 1) {
          place(spots[0], d, "Hidden Single", `${d} can only go here in ${u.name}.`);
          moved = true;
        }
      }
    }
    if (moved) continue;

    // Naked Pair: two cells in a unit sharing the same two candidates clear those digits from the rest of the unit
    for (const u of UNITS) {
      if (moved) break;
      const pairs = u.cells.filter((c) => !vals[c] && count(cand[c]) === 2);
      for (let a = 0; a < pairs.length && !moved; a++)
        for (let b = a + 1; b < pairs.length && !moved; b++) {
          if (cand[pairs[a]] !== cand[pairs[b]]) continue;
          const ds = digitsOf(cand[pairs[a]]);
          const rest = u.cells.filter((c) => !vals[c] && c !== pairs[a] && c !== pairs[b]);
          if (eliminate(rest, ds)) {
            steps.push({ tech: "Naked Pair", text: `${cellName(pairs[a])} and ${cellName(pairs[b])} can only be ${ds.join(" or ")}, so ${ds.join(" and ")} leave the rest of ${u.name}.` });
            moved = true;
          }
        }
    }
    if (moved) continue;

    // Pointing: a digit confined to one row or column inside a region clears that line outside the region
    for (let b = 0; b < N && !moved; b++) {
      const cells = UNITS[12 + b].cells;
      for (let d = 1; d <= N && !moved; d++) {
        const spots = cells.filter((c) => !vals[c] && cand[c] & bit(d));
        if (spots.length < 2) continue;
        const sameRow = spots.every((c) => row(c) === row(spots[0]));
        const sameCol = spots.every((c) => col(c) === col(spots[0]));
        if (!sameRow && !sameCol) continue;
        const line = sameRow ? UNITS[row(spots[0])] : UNITS[6 + col(spots[0])];
        const outside = line.cells.filter((c) => regions[c] !== b && !vals[c]);
        if (eliminate(outside, [d])) {
          steps.push({ tech: "Pointing", text: `In region ${b + 1}, ${d} must sit in ${line.name}, so ${d} is removed from the rest of ${line.name}.` });
          moved = true;
        }
      }
    }
    if (moved) continue;

    // Trial: nothing above applies, so take the answer from the search
    logical = false;
    const i = vals.findIndex((v) => !v);
    place(i, all[0][i], "Trial", `found by trying options and checking for contradictions.`);
  }

  // Safety: our deductions must reproduce the search's answer
  if (vals.join("") !== all[0].join("")) return null;
  return { solution: vals.join(""), steps, logical, unique: total === 1 };
}

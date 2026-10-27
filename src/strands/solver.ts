// Finds where every theme word and the spangram sit on a Strands board.
// Words are paths of touching cells (including diagonals), no cell is used twice, and together
// the words cover all 48 cells. The spangram must also run from one side of the board to the opposite one.

import { STRANDS_COLS as COLS, STRANDS_ROWS as ROWS } from "./nyt.ts";

export interface StrandsPlacement {
  word: string;
  cells: number[]; // board indexes (row * 6 + col) in reading order of the word
  spangram: boolean;
}

export interface StrandsSolution {
  placements: StrandsPlacement[]; // spangram first, then theme words in the order given
  unique: boolean; // exactly one way to tile the board
}

const N = ROWS * COLS;
const NEIGHBORS: number[][] = Array.from({ length: N }, (_, i) => {
  const r = Math.floor(i / COLS), c = i % COLS, out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if ((dr || dc) && rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) out.push(rr * COLS + cc);
    }
  return out;
});

export const cellRow = (i: number) => Math.floor(i / COLS);
export const cellCol = (i: number) => i % COLS;

// True when the path touches both the top and bottom rows, or both the left and right columns
export function spansBoard(cells: number[]) {
  const rows = cells.map(cellRow), cols = cells.map(cellCol);
  return (rows.includes(0) && rows.includes(ROWS - 1)) || (cols.includes(0) && cols.includes(COLS - 1));
}

export function solveStrands(board: string[], spangram: string, themeWords: string[]): StrandsSolution | null {
  const letters = board.join("");
  const words = [spangram, ...themeWords];
  if (letters.length !== N || words.reduce((n, w) => n + w.length, 0) !== N) return null;

  const used = new Uint8Array(N);

  // Every free path spelling `word`; the spangram's paths are restricted to ones crossing the board
  function* paths(word: string, isSpangram: boolean): Generator<number[]> {
    const path: number[] = [];
    function* walk(at: number): Generator<number[]> {
      const k = path.length;
      if (used[at] || letters[at] !== word[k]) return;
      used[at] = 1;
      path.push(at);
      if (k + 1 === word.length) {
        if (!isSpangram || spansBoard(path)) yield [...path];
      } else {
        for (const nb of NEIGHBORS[at]) yield* walk(nb);
      }
      path.pop();
      used[at] = 0;
    }
    for (let s = 0; s < N; s++) yield* walk(s);
  }

  // Each remaining free region must be exactly fillable by some subset of the words still to place
  function regionsFit(remaining: number[]) {
    const reach = new Uint8Array(N);
    const sums = new Set<number>([0]);
    for (const len of remaining) for (const s of [...sums]) sums.add(s + len);
    for (let s = 0; s < N; s++) {
      if (used[s] || reach[s]) continue;
      let size = 0;
      const stack = [s];
      reach[s] = 1;
      while (stack.length) {
        const at = stack.pop()!;
        size++;
        for (const nb of NEIGHBORS[at]) if (!used[nb] && !reach[nb]) { reach[nb] = 1; stack.push(nb); }
      }
      if (!sums.has(size)) return false;
    }
    return true;
  }

  // Place longer words first: they have the fewest paths, which keeps the search tiny
  const order = words.map((w, i) => i).sort((a, b) => (a === 0 ? -1 : b === 0 ? 1 : words[b].length - words[a].length));
  const found: number[][][] = [];
  const chosen: number[][] = new Array(words.length);

  function place(k: number) {
    if (found.length > 1) return;
    if (k === order.length) {
      found.push(chosen.map((p) => [...p]));
      return;
    }
    const w = order[k];
    const rest = order.slice(k + 1).map((i) => words[i].length);
    for (const p of paths(words[w], w === 0)) {
      for (const c of p) used[c] = 1;
      chosen[w] = p;
      if (regionsFit(rest)) place(k + 1);
      for (const c of p) used[c] = 0;
      if (found.length > 1) return;
    }
  }
  place(0);
  if (!found.length) return null;

  return {
    placements: found[0].map((cells, i) => ({ word: words[i], cells, spangram: i === 0 })),
    unique: found.length === 1,
  };
}

// Fetches the daily Queens boards from playqueensgame.com's own JSON endpoint
// (not an official public API). Each day has several board sizes; the `solution`
// field is empty, so the answers are computed by our own solver.

export interface QueensBoard {
  size: number;
  colors: string[]; // colors[i] is the name of region i
  grid: number[][]; // grid[row][col] = region index
}

const BASE = "https://www.playqueensgame.com/api/daily";
const UA = "Mozilla/5.0 (compatible; QueensResultsBot/1.0)";

export async function fetchQueens(isoDate: string): Promise<QueensBoard[] | null> {
  const url = `${BASE}?date=${isoDate}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`playqueensgame.com responded ${res.status} for ${url}`);

  const j = await res.json();
  const bad = () => new Error(`Unexpected payload from ${url}: ${JSON.stringify(j).slice(0, 200)}`);
  if (j?.date !== isoDate || typeof j.puzzles !== "object" || j.puzzles === null) throw bad();

  const boards = Object.values(j.puzzles).map((p: any): QueensBoard => {
    const n = p?.size;
    if (!Number.isInteger(n) || n < 4 || n > 16 || !Array.isArray(p.regions) || p.regions.length !== n) throw bad();
    const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
    const colors: string[] = [];
    p.regions.forEach((reg: any, i: number) => {
      if (typeof reg?.color !== "string" || !Array.isArray(reg.cells)) throw bad();
      colors.push(reg.color);
      for (const cell of reg.cells) {
        const [r, c] = cell;
        // Every cell must belong to exactly one region
        if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || c < 0 || r >= n || c >= n || grid[r][c] !== -1) throw bad();
        grid[r][c] = i;
      }
    });
    if (grid.some((row) => row.includes(-1))) throw bad();
    return { size: n, colors, grid };
  });
  if (boards.length === 0) throw bad();
  return boards.sort((a, b) => a.size - b.size);
}

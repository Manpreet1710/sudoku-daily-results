// Fetches the Pips puzzles (easy, medium, hard) for a date from the New York Times' JSON endpoint
// (the same one the Pips page calls). It is not an official public API.

export type Cell = [row: number, col: number];

export type RegionType = "sum" | "greater" | "less" | "equals" | "unequal" | "empty";

export interface PipsRegion {
  indices: Cell[];
  type: RegionType;
  target?: number; // sum / greater / less only
}

export interface PipsPuzzle {
  id: number;
  constructors: string;
  dominoes: [number, number][];
  regions: PipsRegion[];
  // solution[i] is where dominoes[i] goes: its first value in the first cell, its second in the second
  solution: [Cell, Cell][];
}

export type PipsDifficulty = "easy" | "medium" | "hard";
export const DIFFICULTIES: PipsDifficulty[] = ["easy", "medium", "hard"];

export interface PipsSource {
  editor: string;
  puzzles: Record<PipsDifficulty, PipsPuzzle>;
}

const BASE = "https://www.nytimes.com/svc/pips/v1";
const UA = "Mozilla/5.0 (compatible; PipsResultsBot/1.0)";

const isCell = (c: any): c is Cell => Array.isArray(c) && c.length === 2 && Number.isInteger(c[0]) && Number.isInteger(c[1]) && c[0] >= 0 && c[1] >= 0;

// Throws unless the solution fills every cell exactly once with the listed dominoes and satisfies every region rule.
export function checkPuzzle(p: PipsPuzzle): void {
  const values = new Map<string, number>();
  if (p.solution.length !== p.dominoes.length) throw new Error("solution and dominoes differ in length");
  p.solution.forEach(([a, b], i) => {
    [a, b].forEach((cell, side) => {
      const k = cell.join(",");
      if (values.has(k)) throw new Error(`cell ${k} used twice`);
      values.set(k, p.dominoes[i][side]);
    });
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) throw new Error(`domino ${i} cells are not adjacent`);
  });

  const regionCells = new Set<string>();
  for (const r of p.regions) {
    const vals = r.indices.map((c) => {
      const k = c.join(",");
      regionCells.add(k);
      const v = values.get(k);
      if (v === undefined) throw new Error(`region cell ${k} has no domino`);
      return v;
    });
    const sum = vals.reduce((s, v) => s + v, 0);
    const ok =
      r.type === "sum" ? sum === r.target
      : r.type === "greater" ? sum > r.target!
      : r.type === "less" ? sum < r.target!
      : r.type === "equals" ? new Set(vals).size === 1
      : r.type === "unequal" ? new Set(vals).size === vals.length
      : r.type === "empty";
    if (!ok) throw new Error(`region ${r.type} ${r.target ?? ""} at ${r.indices[0]} is not satisfied by the solution`);
  }
  if (regionCells.size !== values.size) throw new Error("regions do not cover the same cells as the dominoes");
}

export async function fetchPips(isoDate: string): Promise<PipsSource | null> {
  const url = `${BASE}/${isoDate}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`nytimes.com responded ${res.status} for ${url}`);

  const j = await res.json();
  const bad = (why: string) => new Error(`Unexpected payload from ${url} (${why}): ${JSON.stringify(j).slice(0, 200)}`);
  if (j?.printDate !== isoDate) throw bad("printDate");

  const puzzles = {} as Record<PipsDifficulty, PipsPuzzle>;
  for (const d of DIFFICULTIES) {
    const s = j[d];
    if (!s || !Array.isArray(s.dominoes) || !Array.isArray(s.regions) || !Array.isArray(s.solution)) throw bad(`${d} shape`);
    const p: PipsPuzzle = {
      id: Number(s.id),
      constructors: String(s.constructors ?? ""),
      dominoes: s.dominoes,
      regions: s.regions.map((r: any) => ({ indices: r.indices, type: r.type, ...(r.target !== undefined ? { target: r.target } : {}) })),
      solution: s.solution,
    };
    const shapeOk =
      p.dominoes.every((x) => Array.isArray(x) && x.length === 2 && x.every((n) => Number.isInteger(n) && n >= 0 && n <= 6)) &&
      p.regions.every((r) => Array.isArray(r.indices) && r.indices.every(isCell) && ["sum", "greater", "less", "equals", "unequal", "empty"].includes(r.type)) &&
      p.solution.every((pair) => Array.isArray(pair) && pair.length === 2 && pair.every(isCell));
    if (!shapeOk) throw bad(`${d} cells`);
    try {
      checkPuzzle(p);
    } catch (e) {
      throw new Error(`${d} puzzle from ${url} failed validation: ${e instanceof Error ? e.message : e}`);
    }
    puzzles[d] = p;
  }
  return { editor: String(j.editor ?? ""), puzzles };
}

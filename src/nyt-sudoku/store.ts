import { getStore } from "@netlify/blobs";
import type { SolveResult } from "../solver.ts";
import type { NytLevel } from "./nyt.ts";

export interface NytSudokuLevelResult {
  id: number; // NYT puzzle id
  puzzle: string; // 81 digits, 0 = blank
  result: SolveResult;
}

export interface NytSudokuResult {
  date: string; // YYYY-MM-DD, the NYT print date
  levels: Record<NytLevel, NytSudokuLevelResult>;
  crawledAt: string;
}

const store = () => getStore({ name: "nyt-sudoku-results", consistency: "strong" });
const key = (date: string) => `n/${date}`;

export async function getNytSudokuResult(date: string): Promise<NytSudokuResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveNytSudokuResult(r: NytSudokuResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listNytSudokuDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "n/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

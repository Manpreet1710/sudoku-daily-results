import { getStore } from "@netlify/blobs";
import type { MiniSudokuStep, Regions } from "./solver.ts";

export interface MiniSudokuResult {
  date: string; // YYYY-MM-DD
  puzzleId?: number; // LinkedIn's puzzle number, absent for hand-entered days
  name?: string; // the puzzle's title on LinkedIn
  puzzle: string; // 36 digits, 0 for an empty cell
  regions?: Regions; // region number of each cell; 2x3 boxes when absent
  solution: string; // 36 digits
  steps: MiniSudokuStep[];
  logical: boolean;
  addedAt: string;
}

const store = () => getStore({ name: "mini-sudoku-results", consistency: "strong" });
const key = (date: string) => `m/${date}`;

export async function getMiniSudokuResult(date: string): Promise<MiniSudokuResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveMiniSudokuResult(r: MiniSudokuResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listMiniSudokuDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "m/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

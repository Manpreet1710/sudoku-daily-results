import { getStore } from "@netlify/blobs";
import type { SolveResult } from "./solver.ts";

export interface DailyResult {
  date: string; // YYYY-MM-DD
  source: {
    site: "sudoku.com";
    id: string;
    difficulty: string;
    winRate: number;
    apiUrl: string;
  };
  puzzle: string;
  result: SolveResult;
  matchesSource: boolean;
  crawledAt: string;
}

const store = () => getStore({ name: "sudoku-results", consistency: "strong" });
const key = (date: string) => `dc/${date}`;

export async function getResult(date: string): Promise<DailyResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveResult(r: DailyResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "dc/" });
  return blobs.map((b) => b.key.slice(3)).sort().reverse();
}

import { getStore } from "@netlify/blobs";
import type { QueensStep } from "../queens/solver.ts";

export interface QueensPuzzleResult {
  size: number;
  colors: string[];
  grid: number[][];
  queens: [number, number][]; // one per row, 0-based
  steps: QueensStep[];
  logical: boolean;
  level: 1 | 2 | 3 | 4;
  unique: boolean;
}

export interface LinkedInQueensResult {
  date: string; // YYYY-MM-DD
  puzzleId: number; // LinkedIn's puzzle number
  puzzles: QueensPuzzleResult[]; // smallest board first
  crawledAt: string;
}

const store = () => getStore({ name: "linkedin-queens-results", consistency: "strong" });
const key = (date: string) => `q/${date}`;

export async function getLinkedInQueensResult(date: string): Promise<LinkedInQueensResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveLinkedInQueensResult(r: LinkedInQueensResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listLinkedInQueensDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "q/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

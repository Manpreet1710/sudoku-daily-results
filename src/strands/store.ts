import { getStore } from "@netlify/blobs";
import type { StrandsPlacement } from "./solver.ts";

export interface StrandsResult {
  date: string; // YYYY-MM-DD
  clue: string; // the theme hint shown above the board
  editor: string;
  board: string[]; // 8 rows of 6 uppercase letters
  placements: StrandsPlacement[]; // spangram first
  unique: boolean;
  crawledAt: string;
}

const store = () => getStore({ name: "strands-results", consistency: "strong" });
const key = (date: string) => `s/${date}`;

export async function getStrandsResult(date: string): Promise<StrandsResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveStrandsResult(r: StrandsResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listStrandsDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "s/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

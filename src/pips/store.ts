import { getStore } from "@netlify/blobs";
import type { PipsDifficulty, PipsPuzzle } from "./nyt.ts";

export interface PipsResult {
  date: string; // YYYY-MM-DD
  editor: string;
  puzzles: Record<PipsDifficulty, PipsPuzzle>;
  crawledAt: string;
}

const store = () => getStore({ name: "pips-results", consistency: "strong" });
const key = (date: string) => `p/${date}`;

export async function getPipsResult(date: string): Promise<PipsResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function savePipsResult(r: PipsResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listPipsDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "p/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

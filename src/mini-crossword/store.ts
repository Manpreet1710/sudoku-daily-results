import { getStore } from "@netlify/blobs";
import type { MiniPuzzle } from "./api.ts";

export interface MiniResult {
  date: string; // YYYY-MM-DD
  puzzles: MiniPuzzle[]; // easy first, then hard when the site has one
  crawledAt: string;
}

const store = () => getStore({ name: "mini-crossword-results", consistency: "strong" });
const key = (date: string) => `m/${date}`;

export async function getMiniResult(date: string): Promise<MiniResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveMiniResult(r: MiniResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listMiniDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "m/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

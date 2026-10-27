import { getStore } from "@netlify/blobs";
import type { TangoStep } from "./solver.ts";

export interface TangoResult {
  date: string; // YYYY-MM-DD
  board: string; // 108 chars: cells, right-edge markers, bottom-edge markers (see api.ts)
  solution: string; // 36 chars of "O" (sun) / "X" (moon)
  steps: TangoStep[];
  logical: boolean;
  level: 1 | 2 | 3;
  unique: boolean;
  tier: string; // difficulty label from the source site
  generatorVersion: string;
  crawledAt: string;
}

const store = () => getStore({ name: "tango-results", consistency: "strong" });
const key = (date: string) => `t/${date}`;

export async function getTangoResult(date: string): Promise<TangoResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveTangoResult(r: TangoResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listTangoDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "t/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

import { getStore } from "@netlify/blobs";
import type { ZipStep } from "./solver.ts";

export interface ZipResult {
  date: string; // YYYY-MM-DD
  puzzleId: string; // the site's id for this board, e.g. "7x7-hard-d2-012"
  size: number;
  difficulty: "medium" | "hard";
  numbers: [row: number, col: number, n: number][]; // checkpoints, 0-based
  walls: string[]; // "V_r_c": wall right of (r,c); "H_r_c": wall below (r,c)
  path: [number, number][]; // every cell in visiting order
  steps: ZipStep[];
  logical: boolean;
  unique: boolean;
  crawledAt: string;
}

const store = () => getStore({ name: "zip-results", consistency: "strong" });
const key = (date: string) => `z/${date}`;

export async function getZipResult(date: string): Promise<ZipResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveZipResult(r: ZipResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listZipDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "z/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

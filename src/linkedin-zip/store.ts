import { getStore } from "@netlify/blobs";
import type { ZipStep } from "../zip/solver.ts";

export interface LinkedInZipResult {
  date: string; // YYYY-MM-DD
  puzzleId: number; // LinkedIn's puzzle number
  size: number;
  numbers: [row: number, col: number, n: number][]; // checkpoints, 0-based
  walls: string[]; // "V_r_c": wall right of (r,c); "H_r_c": wall below (r,c)
  path: [number, number][]; // every cell in visiting order
  steps: ZipStep[];
  logical: boolean;
  unique: boolean;
  crawledAt: string;
}

const store = () => getStore({ name: "linkedin-zip-results", consistency: "strong" });
const key = (date: string) => `z/${date}`;

export async function getLinkedInZipResult(date: string): Promise<LinkedInZipResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveLinkedInZipResult(r: LinkedInZipResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listLinkedInZipDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "z/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

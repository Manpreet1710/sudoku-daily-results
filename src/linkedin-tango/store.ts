import { getStore } from "@netlify/blobs";
import type { TangoStep } from "../tango/solver.ts";

export interface LinkedInTangoResult {
  date: string; // YYYY-MM-DD
  board: string; // 108 chars: cells, right-edge markers, bottom-edge markers (see api.ts)
  solution: string; // 36 chars of "O" (sun) / "X" (moon)
  steps: TangoStep[];
  logical: boolean;
  level: 1 | 2 | 3;
  unique: boolean;
  puzzleId: number; // LinkedIn's puzzle number
  crawledAt: string;
}

const store = () => getStore({ name: "linkedin-tango-results", consistency: "strong" });
const key = (date: string) => `t/${date}`;

export async function getLinkedInTangoResult(date: string): Promise<LinkedInTangoResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveLinkedInTangoResult(r: LinkedInTangoResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listLinkedInTangoDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "t/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

import { getStore } from "@netlify/blobs";

export interface WordleResult {
  date: string; // YYYY-MM-DD
  number: number;
  solution: string;
  editor: string;
  crawledAt: string;
}

const store = () => getStore({ name: "wordle-results", consistency: "strong" });
const key = (date: string) => `w/${date}`;

export async function getWordleResult(date: string): Promise<WordleResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveWordleResult(r: WordleResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listWordleDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "w/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

import { getStore } from "@netlify/blobs";

export interface SpellingBeeResult {
  date: string; // YYYY-MM-DD
  center: string;
  outer: string[];
  pangrams: string[];
  answers: string[];
  editor: string;
  crawledAt: string;
}

const store = () => getStore({ name: "spelling-bee-results", consistency: "strong" });
const key = (date: string) => `s/${date}`;

export async function getSpellingBeeResult(date: string): Promise<SpellingBeeResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveSpellingBeeResult(r: SpellingBeeResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listSpellingBeeDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "s/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

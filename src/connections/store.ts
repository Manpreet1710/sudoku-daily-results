import { getStore } from "@netlify/blobs";
import type { ConnectionsGroup } from "./nyt.ts";

export interface ConnectionsResult {
  date: string; // YYYY-MM-DD
  groups: ConnectionsGroup[]; // yellow, green, blue, purple
  start: string[];
  editor: string;
  crawledAt: string;
}

const store = () => getStore({ name: "connections-results", consistency: "strong" });
const key = (date: string) => `c/${date}`;

export async function getConnectionsResult(date: string): Promise<ConnectionsResult | null> {
  return (await store().get(key(date), { type: "json" })) ?? null;
}

export async function saveConnectionsResult(r: ConnectionsResult): Promise<void> {
  await store().setJSON(key(r.date), r);
}

// Dates newest first
export async function listConnectionsDates(): Promise<string[]> {
  const { blobs } = await store().list({ prefix: "c/" });
  return blobs.map((b) => b.key.slice(2)).sort().reverse();
}

import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchConnections } from "./nyt.ts";
import { getConnectionsResult, saveConnectionsResult } from "./store.ts";

export const CONNECTIONS_TZ = process.env.CONNECTIONS_TIMEZONE || "Asia/Kolkata";

export const connectionsToday = (offsetDays = 0) => todayIn(CONNECTIONS_TZ, offsetDays);

export async function crawlConnectionsDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The NYT endpoint may also serve upcoming days; never publish a puzzle before its date
    if (date > connectionsToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getConnectionsResult(date))) return { date, status: "exists" };

    const src = await fetchConnections(date);
    if (!src) return { date, status: "not-published" };

    await saveConnectionsResult({ date, groups: src.groups, start: src.start, editor: src.editor, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: "Connections" };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

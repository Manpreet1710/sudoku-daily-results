import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchPips } from "./nyt.ts";
import { getPipsResult, savePipsResult } from "./store.ts";

export const PIPS_TZ = process.env.PIPS_TIMEZONE || "Asia/Kolkata";

export const pipsToday = (offsetDays = 0) => todayIn(PIPS_TZ, offsetDays);

export async function crawlPipsDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The NYT endpoint also serves upcoming days; never publish a puzzle before its date
    if (date > pipsToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getPipsResult(date))) return { date, status: "exists" };

    const src = await fetchPips(date);
    if (!src) return { date, status: "not-published" };

    await savePipsResult({ date, editor: src.editor, puzzles: src.puzzles, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: "Pips" };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

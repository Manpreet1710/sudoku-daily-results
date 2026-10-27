import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchSpellingBee } from "./nyt.ts";
import { getSpellingBeeResult, saveSpellingBeeResult } from "./store.ts";

export const SPELLING_BEE_TZ = process.env.SPELLING_BEE_TIMEZONE || "Asia/Kolkata";

export const spellingBeeToday = (offsetDays = 0) => todayIn(SPELLING_BEE_TZ, offsetDays);

export async function crawlSpellingBeeDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The NYT endpoint may also serve upcoming days; never publish a puzzle before its date
    if (date > spellingBeeToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getSpellingBeeResult(date))) return { date, status: "exists" };

    const src = await fetchSpellingBee(date);
    if (!src) return { date, status: "not-published" };

    await saveSpellingBeeResult({ date, center: src.center, outer: src.outer, pangrams: src.pangrams, answers: src.answers, editor: src.editor, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: "Spelling Bee" };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

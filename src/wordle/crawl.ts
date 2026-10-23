import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchWordleAnswer } from "./nyt.ts";
import { getWordleResult, saveWordleResult } from "./store.ts";

export const WORDLE_TZ = process.env.WORDLE_TIMEZONE || "Asia/Kolkata";

export const wordleToday = (offsetDays = 0) => todayIn(WORDLE_TZ, offsetDays);

export async function crawlWordleDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The NYT endpoint also serves upcoming days; never publish an answer before its date
    if (date > wordleToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getWordleResult(date))) return { date, status: "exists" };

    const src = await fetchWordleAnswer(date);
    if (!src) return { date, status: "not-published" };

    await saveWordleResult({ date, number: src.number, solution: src.solution, editor: src.editor, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: `Wordle #${src.number}` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

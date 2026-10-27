import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchMiniPuzzle, type MiniLevel, type MiniPuzzle } from "./api.ts";
import { getMiniResult, saveMiniResult } from "./store.ts";

export const MINI_TZ = process.env.MINI_CROSSWORD_TIMEZONE || "Asia/Kolkata";

export const miniToday = (offsetDays = 0) => todayIn(MINI_TZ, offsetDays);

export async function crawlMiniDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The API serves a few days ahead; never publish a puzzle before its date
    if (date > miniToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getMiniResult(date))) return { date, status: "exists" };

    const levels: MiniLevel[] = ["easy", "hard"];
    // One request at a time: play.hey.gg answers a burst of requests with 429
    const puzzles: MiniPuzzle[] = [];
    for (const level of levels) {
      const p = await fetchMiniPuzzle(date, level);
      if (p) puzzles.push(p);
    }
    if (!puzzles.length) return { date, status: "not-published" };

    await saveMiniResult({ date, puzzles, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: puzzles.map((p) => `${p.size}x${p.size} ${p.level}`).join(", ") };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

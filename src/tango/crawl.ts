import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchTango } from "./api.ts";
import { solveTango } from "./solver.ts";
import { getTangoResult, saveTangoResult } from "./store.ts";

export const TANGO_TZ = process.env.TANGO_TIMEZONE || "Asia/Kolkata";

export const tangoToday = (offsetDays = 0) => todayIn(TANGO_TZ, offsetDays);

export async function crawlTangoDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The endpoint generates a board for any date; never publish one before its day
    if (date > tangoToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getTangoResult(date))) return { date, status: "exists" };

    const src = await fetchTango(date);
    const s = solveTango(src.board);
    // A wrong answer is worse than a missing page
    if (s.solution.length !== 36) throw new Error("No solution found for this board");

    await saveTangoResult({ date, board: src.board, solution: s.solution, steps: s.steps, logical: s.logical, level: s.level, unique: s.unique, tier: src.tier, generatorVersion: src.generatorVersion, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: "Tango" };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

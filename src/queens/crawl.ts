import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchQueens } from "./api.ts";
import { solveQueens } from "./solver.ts";
import { getQueensResult, saveQueensResult } from "./store.ts";

export const QUEENS_TZ = process.env.QUEENS_TIMEZONE || "Asia/Kolkata";

export const queensToday = (offsetDays = 0) => todayIn(QUEENS_TZ, offsetDays);

export async function crawlQueensDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // Never publish a puzzle before its date
    if (date > queensToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getQueensResult(date))) return { date, status: "exists" };

    const boards = await fetchQueens(date);
    if (!boards) return { date, status: "not-published" };

    const puzzles = boards.map((b) => {
      const s = solveQueens(b.grid, b.colors);
      // A wrong answer is worse than a missing page
      if (s.queens.length !== b.size) throw new Error(`No solution found for the ${b.size}x${b.size} board`);
      return { size: b.size, colors: b.colors, grid: b.grid, queens: s.queens, steps: s.steps, logical: s.logical, level: s.level, unique: s.unique };
    });
    await saveQueensResult({ date, puzzles, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: puzzles.map((p) => `${p.size}x${p.size}`).join(", ") };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

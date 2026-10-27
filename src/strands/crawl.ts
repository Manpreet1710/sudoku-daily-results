import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchStrands } from "./nyt.ts";
import { solveStrands } from "./solver.ts";
import { getStrandsResult, saveStrandsResult } from "./store.ts";

export const STRANDS_TZ = process.env.STRANDS_TIMEZONE || "Asia/Kolkata";

export const strandsToday = (offsetDays = 0) => todayIn(STRANDS_TZ, offsetDays);

export async function crawlStrandsDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The NYT endpoint may also serve upcoming days; never publish a puzzle before its date
    if (date > strandsToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getStrandsResult(date))) return { date, status: "exists" };

    const src = await fetchStrands(date);
    if (!src) return { date, status: "not-published" };

    const sol = solveStrands(src.board, src.spangram, src.themeWords);
    // A board our solver cannot tile means the payload is not what we expect; publish nothing
    if (!sol) return { date, status: "error", detail: "no way to place all words on the board" };

    await saveStrandsResult({
      date,
      clue: src.clue,
      editor: src.editor,
      board: src.board,
      placements: sol.placements,
      unique: sol.unique,
      crawledAt: new Date().toISOString(),
    });
    return { date, status: "saved", detail: "Strands" };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

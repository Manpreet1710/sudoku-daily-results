import type { CrawlOutcome } from "../crawl.ts";
import { linkedinToday } from "../linkedin/date.ts";
import { solveQueens } from "../queens/solver.ts";
import { fetchLinkedInQueens } from "./api.ts";
import { getLinkedInQueensResult, saveLinkedInQueensResult } from "./store.ts";

// LinkedIn only serves the current puzzle, so this crawls "today" (Pacific time) and cannot backfill past days
export async function crawlLinkedInQueensToday({ force = false } = {}): Promise<CrawlOutcome> {
  const date = linkedinToday();
  try {
    if (!force && (await getLinkedInQueensResult(date))) return { date, status: "exists" };

    const src = await fetchLinkedInQueens();
    const { board } = src;
    const s = solveQueens(board.grid, board.colors);
    // A wrong answer is worse than a missing page; LinkedIn's own answer is the cross-check
    if (s.queens.length !== board.size) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our solver found no solution` };
    if (s.queens.some(([r, c], i) => r !== src.siteQueens[i]?.[0] || c !== src.siteQueens[i]?.[1])) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our answer differs from LinkedIn's` };

    await saveLinkedInQueensResult({
      date,
      puzzleId: src.puzzleId,
      puzzles: [{ size: board.size, colors: board.colors, grid: board.grid, queens: s.queens, steps: s.steps, logical: s.logical, level: s.level, unique: s.unique }],
      crawledAt: new Date().toISOString(),
    });
    return { date, status: "saved", detail: `#${src.puzzleId} ${board.size}x${board.size}` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

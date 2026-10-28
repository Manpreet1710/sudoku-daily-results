import type { CrawlOutcome } from "../crawl.ts";
import { linkedinToday } from "../linkedin/date.ts";
import { solveTango } from "../tango/solver.ts";
import { fetchLinkedInTango } from "./api.ts";
import { getLinkedInTangoResult, saveLinkedInTangoResult } from "./store.ts";

// LinkedIn only serves the current puzzle, so this crawls "today" (Pacific time) and cannot backfill past days
export async function crawlLinkedInTangoToday({ force = false } = {}): Promise<CrawlOutcome> {
  const date = linkedinToday();
  try {
    if (!force && (await getLinkedInTangoResult(date))) return { date, status: "exists" };

    const src = await fetchLinkedInTango();
    const s = solveTango(src.board);
    // A wrong answer is worse than a missing page; LinkedIn's own answer is the cross-check
    if (s.solution.length !== 36) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our solver found no solution` };
    if (s.solution !== src.siteSolution) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our answer differs from LinkedIn's` };

    await saveLinkedInTangoResult({ date, puzzleId: src.puzzleId, board: src.board, solution: s.solution, steps: s.steps, logical: s.logical, level: s.level, unique: s.unique, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: `#${src.puzzleId}` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

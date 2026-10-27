import type { CrawlOutcome } from "../crawl.ts";
import { fetchMiniSudoku } from "./api.ts";
import { MINI_SUDOKU_TZ, miniSudokuToday } from "./add.ts";
import { solveMiniSudoku } from "./solver.ts";
import { getMiniSudokuResult, saveMiniSudokuResult } from "./store.ts";

export { MINI_SUDOKU_TZ, miniSudokuToday };

// LinkedIn only serves the current puzzle, so this crawls "today" (Pacific time) and cannot backfill past days
export async function crawlMiniSudokuToday({ force = false } = {}): Promise<CrawlOutcome> {
  const date = miniSudokuToday();
  try {
    const existing = await getMiniSudokuResult(date);
    if (existing && !force) return { date, status: "exists" };

    const src = await fetchMiniSudoku();
    if (existing?.puzzleId === src.puzzleId && !force) return { date, status: "exists" };

    const s = solveMiniSudoku(src.puzzle, src.regions);
    // A wrong answer is worse than a missing page; LinkedIn's own solution is the cross-check
    if (!s) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our solver found no solution` };
    if (!s.unique) return { date, status: "error", detail: `puzzle ${src.puzzleId}: clues allow more than one solution` };
    if (s.solution !== src.siteSolution) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our answer differs from LinkedIn's` };

    await saveMiniSudokuResult({
      date,
      puzzleId: src.puzzleId,
      name: src.name,
      puzzle: src.puzzle,
      regions: src.regions,
      solution: s.solution,
      steps: s.steps,
      logical: s.logical,
      addedAt: new Date().toISOString(),
    });
    return { date, status: "saved", detail: `#${src.puzzleId} ${src.name} (${s.steps.length} steps${s.logical ? "" : ", needed a trial"})` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

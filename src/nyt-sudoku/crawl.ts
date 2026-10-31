import type { CrawlOutcome } from "../crawl.ts";
import { solve } from "../solver.ts";
import { fetchNytSudoku, NYT_LEVELS, type NytLevel } from "./nyt.ts";
import { getNytSudokuResult, saveNytSudokuResult, type NytSudokuLevelResult } from "./store.ts";

// The NYT page only ever serves the current puzzles, so this saves "today" under the date the NYT prints
// on them and cannot backfill past days.
export async function crawlNytSudoku({ force = false } = {}): Promise<CrawlOutcome> {
  let date = "";
  try {
    const src = await fetchNytSudoku();
    date = src.date;
    if (!force && (await getNytSudokuResult(date))) return { date, status: "exists" };

    const levels = {} as Record<NytLevel, NytSudokuLevelResult>;
    for (const l of NYT_LEVELS) {
      const p = src.levels[l];
      const result = solve(p.puzzle);
      // A wrong answer is worse than a missing page; the NYT's own solution is the cross-check
      if (!result.solved) return { date, status: "error", detail: `${l} #${p.id}: our solver could not solve it` };
      if (!result.uniqueSolution) return { date, status: "error", detail: `${l} #${p.id}: clues allow more than one solution` };
      if (result.solution !== p.solution) return { date, status: "error", detail: `${l} #${p.id}: our answer differs from the NYT's` };
      levels[l] = { id: p.id, puzzle: p.puzzle, result };
    }

    await saveNytSudokuResult({ date, levels, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: NYT_LEVELS.map((l) => `${l} ${levels[l].result.steps.length} steps`).join(", ") };
  } catch (e) {
    return { date: date || "unknown", status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

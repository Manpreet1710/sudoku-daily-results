import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { solveMiniSudoku } from "./solver.ts";
import { getMiniSudokuResult, saveMiniSudokuResult } from "./store.ts";

// LinkedIn rolls its games over at midnight Pacific time, so that is the date a puzzle belongs to
export const MINI_SUDOKU_TZ = process.env.MINI_SUDOKU_TIMEZONE || "America/Los_Angeles";

export const miniSudokuToday = (offsetDays = 0) => todayIn(MINI_SUDOKU_TZ, offsetDays);

// Hand-entered fallback (row by row, 0 or . for empty) for a day the daily crawl missed; standard 2x3 boxes.
// The solver must find exactly one solution before anything is published.
export async function addMiniSudokuPuzzle(date: string, rawPuzzle: string, { force = false } = {}): Promise<CrawlOutcome> {
  const puzzle = rawPuzzle.replace(/[\s,]/g, "").replace(/[.\-_]/g, "0");
  if (!/^[0-6]{36}$/.test(puzzle)) return { date, status: "error", detail: "puzzle must be 36 characters: digits 1-6, and 0 or . for empty cells" };
  if (date > miniSudokuToday(1)) return { date, status: "error", detail: "date is in the future" };
  if (!force && (await getMiniSudokuResult(date))) return { date, status: "exists" };

  const s = solveMiniSudoku(puzzle);
  if (!s) return { date, status: "error", detail: "these clues break a rule or have no solution; check the digits" };
  if (!s.unique) return { date, status: "error", detail: "these clues allow more than one solution; check the digits" };

  await saveMiniSudokuResult({ date, puzzle, solution: s.solution, steps: s.steps, logical: s.logical, addedAt: new Date().toISOString() });
  return { date, status: "saved", detail: `${s.steps.length} steps${s.logical ? "" : ", needed a trial"}` };
}

// Today's Mini Sudoku from LinkedIn (see ../linkedin/client.ts for how the guest endpoint is read).

import { fetchLinkedInGame, LINKEDIN_GAME } from "../linkedin/client.ts";
import type { Regions } from "./solver.ts";

export interface MiniSudokuSource {
  puzzleId: number;
  name: string;
  puzzle: string; // 36 digits, 0 for an empty cell
  regions: Regions;
  siteSolution: string; // LinkedIn's own answer, used only as a cross-check
}

export async function fetchMiniSudoku(): Promise<MiniSudokuSource> {
  const { puzzleId, puzzle: p } = await fetchLinkedInGame(LINKEDIN_GAME.miniSudoku, "miniSudokuGamePuzzle", "mini-sudoku");
  const bad = (why: string) => new Error(`Unexpected payload from linkedin.com: ${why}`);
  if (p.gridRowSize !== 6 || p.gridColSize !== 6) throw bad("grid is not 6x6");
  if (p.columnRestrictions?.length) throw bad("extra column restrictions are not supported");

  const solution: unknown = p.solution;
  const given: unknown = p.presetCellIdxes;
  if (!Array.isArray(solution) || solution.length !== 36 || !solution.every((d) => Number.isInteger(d) && d >= 1 && d <= 6)) throw bad("solution");
  if (!Array.isArray(given) || !given.every((i) => Number.isInteger(i) && i >= 0 && i < 36)) throw bad("given cells");

  const regions: Regions = new Array(36).fill(-1);
  (p.regions as { cellIdxes: number[] }[] | undefined)?.forEach((r, g) => r.cellIdxes?.forEach((i) => (regions[i] = g)));
  if (regions.some((g) => g < 0 || g > 5)) throw bad("regions");

  const puzzle = solution.map((d, i) => (given.includes(i) ? d : 0)).join("");
  return { puzzleId, name: String(p.name ?? ""), puzzle, regions, siteSolution: solution.join("") };
}

// LinkedIn's own Queens puzzle for today. The payload carries the color regions and LinkedIn's answer;
// we only use the regions to solve, and the answer to cross-check our solver.

import { fetchLinkedInGame, LINKEDIN_GAME } from "../linkedin/client.ts";
import type { QueensBoard } from "../queens/api.ts";

export interface LinkedInQueensSource {
  puzzleId: number;
  board: QueensBoard;
  siteQueens: [number, number][]; // LinkedIn's own answer, for cross-checking only
}

// Names our page colors know, so a hint can say "the green region"; LinkedIn only sends numbers
const COLOR_NAMES = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "lime", "gray", "gold"];

export async function fetchLinkedInQueens(): Promise<LinkedInQueensSource> {
  const { puzzleId, puzzle: p } = await fetchLinkedInGame(LINKEDIN_GAME.queens, "queensGamePuzzle", "queens");
  const bad = (why: string) => new Error(`Unexpected payload from linkedin.com: ${why}`);
  const n = p?.gridSize;
  if (!Number.isInteger(n) || n < 4 || n > 16 || p.colorGrid?.length !== n || p.solution?.length !== n) throw bad("queens grid");

  // LinkedIn numbers its colors arbitrarily (6, 4, 0, ...); give each one a region index in order of first appearance
  const ids: number[] = [];
  const grid: number[][] = p.colorGrid.map((row: any) => {
    if (!Array.isArray(row?.colors) || row.colors.length !== n) throw bad("color row");
    return row.colors.map((c: number) => {
      if (!ids.includes(c)) ids.push(c);
      return ids.indexOf(c);
    });
  });
  if (ids.length !== n) throw bad(`${ids.length} color regions on a ${n}x${n} board`);
  const siteQueens = p.solution.map((q: any): [number, number] => [q.row, q.col]);
  if (siteQueens.some(([r, c]: [number, number]) => !Number.isInteger(r) || !Number.isInteger(c))) throw bad("queen positions");

  return { puzzleId, board: { size: n, colors: ids.map((_, i) => COLOR_NAMES[i] ?? `region ${i + 1}`), grid }, siteQueens };
}

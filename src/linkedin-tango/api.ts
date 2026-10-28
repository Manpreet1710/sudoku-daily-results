// LinkedIn's own Tango puzzle for today, converted to the 108-character board our solver reads:
// 36 cells ("O" sun, "X" moon, "." empty), then 36 right-edge and 36 bottom-edge markers ("=", "x", ".").
// LinkedIn calls a sun ZERO and a moon ONE.

import { fetchLinkedInGame, LINKEDIN_GAME } from "../linkedin/client.ts";

export interface LinkedInTangoSource {
  puzzleId: number;
  board: string;
  siteSolution: string; // LinkedIn's own answer ("O"/"X" per cell), for cross-checking only
}

export async function fetchLinkedInTango(): Promise<LinkedInTangoSource> {
  const { puzzleId, puzzle: p } = await fetchLinkedInGame(LINKEDIN_GAME.tango, "lotkaGamePuzzle", "tango");
  const bad = (why: string) => new Error(`Unexpected payload from linkedin.com: ${why}`);
  const n = 6;
  if (p?.gridSize !== n || p.solution?.length !== n * n || !Array.isArray(p.presetCellIdxes) || !Array.isArray(p.edges)) throw bad("tango grid");

  const siteSolution = p.solution.map((v: string) => (v === "ZERO" ? "O" : v === "ONE" ? "X" : "?")).join("");
  if (siteSolution.includes("?")) throw bad("cell values");

  const cells = [...siteSolution].map((ch, i) => (p.presetCellIdxes.includes(i) ? ch : "."));
  const right: string[] = new Array(n * n).fill(".");
  const down: string[] = new Array(n * n).fill(".");
  for (const e of p.edges) {
    const [a, b] = e.startIdx < e.endIdx ? [e.startIdx, e.endIdx] : [e.endIdx, e.startIdx];
    const mark = e.isEqual ? "=" : "x";
    if (b === a + 1 && a % n !== n - 1) right[a] = mark;
    else if (b === a + n) down[a] = mark;
    else throw bad(`edge ${a}-${b} joins cells that are not neighbours`);
  }
  return { puzzleId, board: cells.join("") + right.join("") + down.join(""), siteSolution };
}

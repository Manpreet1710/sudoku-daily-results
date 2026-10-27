// Fetches today's Mini Sudoku from LinkedIn's guest GraphQL endpoint, the same call the game page makes
// for a signed-out visitor. It is not an official public API: it only ever serves the current puzzle, and the
// queryId below can change when LinkedIn redeploys (set LINKEDIN_MINI_SUDOKU_QUERY_ID to follow it).

import type { Regions } from "./solver.ts";

export interface MiniSudokuSource {
  puzzleId: number;
  name: string;
  puzzle: string; // 36 digits, 0 for an empty cell
  regions: Regions;
  siteSolution: string; // LinkedIn's own answer, used only as a cross-check
}

const PAGE = "https://www.linkedin.com/games/view/mini-sudoku/desktop";
const QUERY_ID = process.env.LINKEDIN_MINI_SUDOKU_QUERY_ID || "voyagerIdentityDashGames.22685dd4999129d6bed79f33e65dcbc5";
const UA = "Mozilla/5.0 (compatible; MiniSudokuResultsBot/1.0)";
const MINI_SUDOKU_GAME_TYPE_ID = 7;

export async function fetchMiniSudoku(): Promise<MiniSudokuSource> {
  // A signed-out visit hands out a session cookie; its JSESSIONID doubles as the csrf-token header
  const page = await fetch(PAGE, { headers: { "User-Agent": UA } });
  if (!page.ok) throw new Error(`linkedin.com responded ${page.status} for the game page`);
  const cookies = page.headers.getSetCookie().map((c) => c.split(";")[0]);
  const csrf = cookies.find((c) => c.startsWith("JSESSIONID="))?.slice("JSESSIONID=".length).replace(/"/g, "");
  if (!csrf) throw new Error("linkedin.com did not start a guest session");

  const url = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(gameTypeId:${MINI_SUDOKU_GAME_TYPE_ID})&queryId=${QUERY_ID}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/vnd.linkedin.normalized+json+2.1", "csrf-token": csrf, Cookie: cookies.join("; ") },
  });
  if (!res.ok) throw new Error(`linkedin.com responded ${res.status} for the puzzle call (the queryId may have changed)`);

  const j = await res.json();
  const bad = (why: string) => new Error(`Unexpected payload from linkedin.com: ${why}`);
  const game = (j?.included as any[] | undefined)?.find((x) => x?.gameTypeId === MINI_SUDOKU_GAME_TYPE_ID && x.gamePuzzle?.miniSudokuGamePuzzle);
  const p = game?.gamePuzzle.miniSudokuGamePuzzle;
  if (!p) throw bad("no Mini Sudoku puzzle");
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
  return { puzzleId: Number(game.puzzleId), name: String(p.name ?? ""), puzzle, regions, siteSolution: solution.join("") };
}

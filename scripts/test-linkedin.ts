// Fetches today's LinkedIn Queens, Tango, Zip and Mini Sudoku and checks that our own solvers reach LinkedIn's answers.
// Usage: npm run test:linkedin
import { fetchLinkedInQueens } from "../src/linkedin-queens/api.ts";
import { fetchLinkedInTango } from "../src/linkedin-tango/api.ts";
import { fetchLinkedInZip } from "../src/linkedin-zip/api.ts";
import { fetchMiniSudoku } from "../src/mini-sudoku/api.ts";
import { solveQueens } from "../src/queens/solver.ts";
import { solveTango } from "../src/tango/solver.ts";
import { solveZip } from "../src/zip/solver.ts";
import { solveMiniSudoku } from "../src/mini-sudoku/solver.ts";

let failures = 0;
const check = async (name: string, run: () => Promise<string>) => {
  try {
    console.log(name.padEnd(12), "OK  ", await run());
  } catch (e) {
    failures++;
    console.log(name.padEnd(12), "FAIL", e instanceof Error ? e.message : e);
  }
};

await check("Queens", async () => {
  const s = await fetchLinkedInQueens();
  const r = solveQueens(s.board.grid, s.board.colors);
  const mine = r.queens.map(([a, b]) => `${a},${b}`).join(" ");
  if (mine !== s.siteQueens.map(([a, b]) => `${a},${b}`).join(" ")) throw new Error("our queens differ from LinkedIn's");
  return `#${s.puzzleId} ${s.board.size}x${s.board.size} ${r.logical ? "logical" : "search"} unique=${r.unique} ${r.steps.length} steps`;
});
await check("Tango", async () => {
  const s = await fetchLinkedInTango();
  const r = solveTango(s.board);
  if (r.solution !== s.siteSolution) throw new Error("our solution differs from LinkedIn's");
  return `#${s.puzzleId} ${r.logical ? "logical" : "search"} unique=${r.unique} ${r.steps.length} steps`;
});
await check("Zip", async () => {
  const s = await fetchLinkedInZip();
  const r = solveZip(s);
  if (r.path.some(([a, b], i) => a !== s.sitePath[i]?.[0] || b !== s.sitePath[i]?.[1])) throw new Error("our path differs from LinkedIn's");
  return `#${s.puzzleId} ${s.size}x${s.size} walls=${s.walls.length} ${r.logical ? "logical" : "search"} unique=${r.unique} ${r.steps.length} steps`;
});
await check("Mini Sudoku", async () => {
  const s = await fetchMiniSudoku();
  const r = solveMiniSudoku(s.puzzle, s.regions);
  if (!r || r.solution !== s.siteSolution) throw new Error("our solution differs from LinkedIn's");
  return `#${s.puzzleId} "${s.name}" ${r.logical ? "logical" : "search"} unique=${r.unique} ${r.steps.length} steps`;
});
process.exit(failures ? 1 : 0);

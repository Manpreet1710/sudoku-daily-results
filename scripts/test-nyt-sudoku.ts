// Fetches today's NYT Sudoku puzzles and checks that our solver reproduces the NYT's own answer for each one.
// Usage: npm run test:nyt-sudoku
import { fetchNytSudoku, NYT_LEVELS } from "../src/nyt-sudoku/nyt.ts";
import { solve } from "../src/solver.ts";

const src = await fetchNytSudoku();
console.log("NYT Sudoku", src.date);
let failures = 0;
for (const l of NYT_LEVELS) {
  const p = src.levels[l];
  const r = solve(p.puzzle);
  const ok = r.solved && r.uniqueSolution && r.solution === p.solution;
  if (!ok) failures++;
  console.log(l.padEnd(6), `#${p.id}`, `${r.givens} clues`, `${r.steps.length} steps`, r.rating, ok ? "OK" : `FAIL (solved=${r.solved} unique=${r.uniqueSolution} matches=${r.solution === p.solution})`);
}
process.exit(failures ? 1 : 0);

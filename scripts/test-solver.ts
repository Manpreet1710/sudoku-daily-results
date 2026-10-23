// Crawls recent sudoku.com Daily Challenges and checks our solver against their answers.
// Usage: npm run test:solver [-- 2026-10-23]
import { solve } from "../src/solver.ts";
import { fetchDailyChallenge } from "../src/sudoku-com.ts";
import { shiftDate, todayIn } from "../src/crawl.ts";

const end = process.argv[2] ?? todayIn();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  const src = await fetchDailyChallenge(date);
  if (!src) {
    console.log(date, "not published");
    continue;
  }
  const r = solve(src.mission);
  const ok = r.solved && r.solution === src.solution;
  if (!ok) failures++;
  console.log(date, ok ? "OK  " : "FAIL", src.difficulty.padEnd(6), r.rating.padEnd(7), `${r.timeMs}ms`, JSON.stringify(r.techniques));
}
process.exit(failures ? 1 : 0);

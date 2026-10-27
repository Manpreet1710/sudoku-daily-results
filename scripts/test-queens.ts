// Fetches the Queens boards for the last 7 days, solves them and prints size, difficulty and uniqueness.
// Usage: npm run test:queens [-- 2026-10-23]
import { fetchQueens } from "../src/queens/api.ts";
import { solveQueens } from "../src/queens/solver.ts";
import { queensToday } from "../src/queens/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? queensToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const boards = await fetchQueens(date);
    if (!boards) {
      console.log(date, "not published");
      continue;
    }
    for (const b of boards) {
      const s = solveQueens(b.grid, b.colors);
      const ok = s.queens.length === b.size && s.unique;
      if (!ok) failures++;
      console.log(date, `${b.size}x${b.size}`, ok ? "OK" : "FAIL", `level ${s.level}`, s.logical ? "logic" : "SEARCH", `${s.steps.length} steps`, s.unique ? "" : "(not unique)");
    }
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

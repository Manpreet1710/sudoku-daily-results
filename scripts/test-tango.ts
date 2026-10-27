// Fetches the Tango board for the last 14 days, solves each and prints difficulty and uniqueness.
// Usage: npm run test:tango [-- 2026-10-23]
import { fetchTango } from "../src/tango/api.ts";
import { solveTango } from "../src/tango/solver.ts";
import { tangoToday } from "../src/tango/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? tangoToday();
let failures = 0;
for (let i = 13; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchTango(date);
    const s = solveTango(src.board);
    const ok = s.solution.length === 36 && s.unique;
    if (!ok) failures++;
    console.log(date, ok ? "OK" : "FAIL", `site: ${src.tier}`, `level ${s.level}`, s.logical ? "logic" : "SEARCH", `${s.steps.length} steps`, s.unique ? "" : "(not unique)");
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

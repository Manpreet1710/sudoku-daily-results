// Checks the NYT Strands endpoint for the last 7 days and solves each board with our own solver.
// Usage: npm run test:strands [-- 2026-10-26]
import { fetchStrands } from "../src/strands/nyt.ts";
import { solveStrands } from "../src/strands/solver.ts";
import { strandsToday } from "../src/strands/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? strandsToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchStrands(date);
    if (!src) {
      console.log(date, "not published");
      continue;
    }
    const t = performance.now();
    const sol = solveStrands(src.board, src.spangram, src.themeWords);
    const ms = Math.round(performance.now() - t);
    if (!sol) {
      failures++;
      console.log(date, "FAIL no tiling", src.spangram, src.themeWords.join(","));
      continue;
    }
    console.log(date, `#${src.id}`, `spangram ${src.spangram}`, `${src.themeWords.length} words`, sol.unique ? "unique" : "NOT unique", `${ms} ms`);
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

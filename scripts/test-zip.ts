// Picks the Zip board for the last 14 days, solves it and cross-checks the site's own answer path.
// Usage: npm run test:zip [-- 2026-10-23]
import { fetchZip, ZIP_FIRST_DATE } from "../src/zip/api.ts";
import { solveZip } from "../src/zip/solver.ts";
import { zipToday } from "../src/zip/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? zipToday();
let failures = 0;
for (let i = 13; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchZip(date);
    if (!src) {
      console.log(date, `before ${ZIP_FIRST_DATE}, skipped`);
      continue;
    }
    const s = solveZip(src);
    const same = s.path.length === src.size * src.size && s.path.every(([r, c], k) => r === src.sitePath[k][0] && c === src.sitePath[k][1]);
    if (!same || !s.unique) failures++;
    console.log(date, src.id, same ? "OK" : "FAIL", s.logical ? "logic" : "SEARCH", `${s.steps.length} steps`, s.unique ? "" : "(not unique)");
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

// Checks the NYT Pips endpoint for the last 7 days: every puzzle's solution must satisfy its own rules.
// Usage: npm run test:pips [-- 2026-10-31]
import { fetchPips } from "../src/pips/nyt.ts";
import { pipsToday } from "../src/pips/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? pipsToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchPips(date);
    if (!src) {
      console.log(date, "not published");
      continue;
    }
    console.log(date, "OK", Object.entries(src.puzzles).map(([d, p]) => `${d} #${p.id} (${p.dominoes.length} dominoes)`).join(" | "));
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

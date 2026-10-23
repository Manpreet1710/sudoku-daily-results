// Checks the NYT Wordle endpoint for the last 7 days and prints the derived hints.
// Usage: npm run test:wordle [-- 2026-10-23]
import { fetchWordleAnswer } from "../src/wordle/nyt.ts";
import { wordleHints } from "../src/wordle/hints.ts";
import { shiftDate } from "../src/crawl.ts";
import { wordleToday } from "../src/wordle/crawl.ts";

const end = process.argv[2] ?? wordleToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchWordleAnswer(date);
    if (!src) {
      console.log(date, "not published");
      continue;
    }
    console.log(date, `#${src.number}`, src.solution, "|", wordleHints(src.solution).slice(0, 2).join(" "));
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

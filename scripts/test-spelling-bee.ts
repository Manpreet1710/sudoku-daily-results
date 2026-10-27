// Checks the NYT Spelling Bee endpoint for the last 7 days and prints each puzzle's letters and word count.
// Usage: npm run test:spelling-bee [-- 2026-10-23]
import { fetchSpellingBee } from "../src/spelling-bee/nyt.ts";
import { spellingBeeToday } from "../src/spelling-bee/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? spellingBeeToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchSpellingBee(date);
    if (!src) {
      console.log(date, "not published");
      continue;
    }
    console.log(date, `${src.center.toUpperCase()} + ${src.outer.join("").toUpperCase()}`, `${src.answers.length} words`, `pangram: ${src.pangrams.join(", ")}`);
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

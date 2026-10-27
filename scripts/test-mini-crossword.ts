// Checks the Mini Crossword API for the last 7 days: each grid must number and fill consistently with its clues.
// Usage: npm run test:mini-crossword [-- 2026-10-26]
import { fetchMiniPuzzle } from "../src/mini-crossword/api.ts";
import { miniToday } from "../src/mini-crossword/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? miniToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  for (const level of ["easy", "hard"] as const) {
    try {
      const p = await fetchMiniPuzzle(date, level);
      if (!p) console.log(date, level, "not published");
      else console.log(date, level, `${p.size}x${p.size}`, `"${p.title}"`, `${p.across.length} across, ${p.down.length} down`, p.across.map((e) => e.answer).join(" "));
    } catch (e) {
      failures++;
      console.log(date, level, "FAIL", e instanceof Error ? e.message : e);
    }
  }
}
process.exit(failures ? 1 : 0);

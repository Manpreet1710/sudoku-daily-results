// Checks the NYT Connections endpoint for the last 7 days and prints each puzzle's category titles.
// Usage: npm run test:connections [-- 2026-10-23]
import { fetchConnections } from "../src/connections/nyt.ts";
import { connectionsToday } from "../src/connections/crawl.ts";
import { shiftDate } from "../src/crawl.ts";

const end = process.argv[2] ?? connectionsToday();
let failures = 0;
for (let i = 6; i >= 0; i--) {
  const date = shiftDate(end, -i);
  try {
    const src = await fetchConnections(date);
    if (!src) {
      console.log(date, "not published");
      continue;
    }
    console.log(date, src.groups.map((g) => g.title).join(" | "));
  } catch (e) {
    failures++;
    console.log(date, "FAIL", e instanceof Error ? e.message : e);
  }
}
process.exit(failures ? 1 : 0);

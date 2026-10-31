import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlNytSudoku } from "../../src/nyt-sudoku/crawl.ts";

// The NYT page only serves the current puzzles (the next day's appear in the evening), so check four times a
// day and save whatever date it prints; days that already exist are skipped.
export default alerting("nyt-sudoku-daily-crawl", async () => {
  const outcome = await crawlNytSudoku();
  console.log("[nyt-sudoku-daily-crawl]", JSON.stringify(outcome));
  await alertCrawl("nyt-sudoku-daily-crawl", outcome);

  if (outcome.status === "saved") {
    await purgeCache({ tags: ["nyt-sudoku-index"] });
  }
});

export const config: Config = {
  schedule: "25 0,6,12,18 * * *",
};

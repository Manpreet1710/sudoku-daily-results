import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlMiniSudokuToday } from "../../src/mini-sudoku/crawl.ts";

// LinkedIn rolls its games over at midnight Pacific (07:00 or 08:00 UTC depending on daylight saving).
// Several runs a day catch the new puzzle and retry if LinkedIn was slow; a day that is already saved is skipped.
export default alerting("mini-sudoku-daily-crawl", async () => {
  const outcome = await crawlMiniSudokuToday();
  console.log("[mini-sudoku-daily-crawl]", JSON.stringify(outcome));
  await alertCrawl("mini-sudoku-daily-crawl", outcome);

  if (outcome.status === "saved") {
    await purgeCache({ tags: ["mini-sudoku-index"] });
  }
});

export const config: Config = {
  schedule: "10 7,8,10,14 * * *",
};

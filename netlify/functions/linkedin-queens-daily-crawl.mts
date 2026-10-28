import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlLinkedInQueensToday } from "../../src/linkedin-queens/crawl.ts";

// LinkedIn rolls its games over at midnight Pacific (07:00 or 08:00 UTC depending on daylight saving).
// Several runs a day catch the new puzzle and retry if LinkedIn was slow; a day that is already saved is skipped.
export default alerting("linkedin-queens-daily-crawl", async () => {
  const outcome = await crawlLinkedInQueensToday();
  console.log("[linkedin-queens-daily-crawl]", JSON.stringify(outcome));
  await alertCrawl("linkedin-queens-daily-crawl", outcome);

  if (outcome.status === "saved") {
    await purgeCache({ tags: ["linkedin-queens-index"] });
  }
});

export const config: Config = {
  schedule: "12 7,8,10,14 * * *",
};

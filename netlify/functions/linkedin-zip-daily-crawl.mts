import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlLinkedInZipToday } from "../../src/linkedin-zip/crawl.ts";

// LinkedIn rolls its games over at midnight Pacific (07:00 or 08:00 UTC depending on daylight saving).
// Several runs a day catch the new puzzle and retry if LinkedIn was slow; a day that is already saved is skipped.
export default alerting("linkedin-zip-daily-crawl", async () => {
  const outcome = await crawlLinkedInZipToday();
  console.log("[linkedin-zip-daily-crawl]", JSON.stringify(outcome));
  await alertCrawl("linkedin-zip-daily-crawl", outcome);

  if (outcome.status === "saved") {
    await purgeCache({ tags: ["linkedin-zip-index"] });
  }
});

export const config: Config = {
  schedule: "16 7,8,10,14 * * *",
};

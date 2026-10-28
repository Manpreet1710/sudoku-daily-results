import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlLinkedInTangoToday } from "../../src/linkedin-tango/crawl.ts";

// LinkedIn rolls its games over at midnight Pacific (07:00 or 08:00 UTC depending on daylight saving).
// Several runs a day catch the new puzzle and retry if LinkedIn was slow; a day that is already saved is skipped.
export default alerting("linkedin-tango-daily-crawl", async () => {
  const outcome = await crawlLinkedInTangoToday();
  console.log("[linkedin-tango-daily-crawl]", JSON.stringify(outcome));
  await alertCrawl("linkedin-tango-daily-crawl", outcome);

  if (outcome.status === "saved") {
    await purgeCache({ tags: ["linkedin-tango-index"] });
  }
});

export const config: Config = {
  schedule: "14 7,8,10,14 * * *",
};

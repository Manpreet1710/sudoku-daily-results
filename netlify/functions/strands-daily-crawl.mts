import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlStrandsDate, strandsToday } from "../../src/strands/crawl.ts";

// Runs every day just after midnight IST (19:15 UTC). Also retries yesterday in case a run was missed.
// If STRANDS_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default alerting("strands-daily-crawl", async () => {
  const outcomes = await Promise.all([crawlStrandsDate(strandsToday()), crawlStrandsDate(strandsToday(-1))]);
  console.log("[strands-daily-crawl]", JSON.stringify(outcomes));
  await alertCrawl("strands-daily-crawl", outcomes);

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["strands-index"] });
  }
});

export const config: Config = {
  schedule: "15 0,19 * * *",
};

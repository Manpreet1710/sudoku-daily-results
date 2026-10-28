import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlZipDate, zipToday } from "../../src/zip/crawl.ts";

// Runs just after midnight IST (19:15 UTC) and again at 00:15 UTC, since the site's own day may roll over later. Also retries yesterday in case a run was missed.
// If ZIP_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default alerting("zip-daily-crawl", async () => {
  const outcomes = await Promise.all([crawlZipDate(zipToday()), crawlZipDate(zipToday(-1))]);
  console.log("[zip-daily-crawl]", JSON.stringify(outcomes));
  await alertCrawl("zip-daily-crawl", outcomes);

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["zip-index"] });
  }
});

export const config: Config = {
  schedule: "15 0,19 * * *",
};

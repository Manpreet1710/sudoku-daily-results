import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlSpellingBeeDate, spellingBeeToday } from "../../src/spelling-bee/crawl.ts";

// Runs every day just after midnight IST (19:15 UTC). Also retries yesterday in case a run was missed.
// If SPELLING_BEE_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default alerting("spelling-bee-daily-crawl", async () => {
  const outcomes = await Promise.all([crawlSpellingBeeDate(spellingBeeToday()), crawlSpellingBeeDate(spellingBeeToday(-1))]);
  console.log("[spelling-bee-daily-crawl]", JSON.stringify(outcomes));
  await alertCrawl("spelling-bee-daily-crawl", outcomes);

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["spelling-bee-index"] });
  }
});

export const config: Config = {
  schedule: "15 19 * * *",
};

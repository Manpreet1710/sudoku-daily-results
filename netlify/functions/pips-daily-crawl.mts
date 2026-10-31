import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlPipsDate, pipsToday } from "../../src/pips/crawl.ts";

// Runs every day just after midnight IST (19:20 UTC). Also retries yesterday in case a run was missed.
// If PIPS_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default alerting("pips-daily-crawl", async () => {
  const outcomes = await Promise.all([crawlPipsDate(pipsToday()), crawlPipsDate(pipsToday(-1))]);
  console.log("[pips-daily-crawl]", JSON.stringify(outcomes));
  await alertCrawl("pips-daily-crawl", outcomes);

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["pips-index"] });
  }
});

export const config: Config = {
  schedule: "20 19 * * *",
};

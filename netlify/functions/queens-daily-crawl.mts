import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlQueensDate, queensToday } from "../../src/queens/crawl.ts";

// Runs just after midnight IST (19:15 UTC) and again at 00:15 UTC, since the site's own day may roll over later. Also retries yesterday in case a run was missed.
// If QUEENS_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default alerting("queens-daily-crawl", async () => {
  const outcomes = await Promise.all([crawlQueensDate(queensToday()), crawlQueensDate(queensToday(-1))]);
  console.log("[queens-daily-crawl]", JSON.stringify(outcomes));
  await alertCrawl("queens-daily-crawl", outcomes);

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["queens-index"] });
  }
});

export const config: Config = {
  schedule: "15 0,19 * * *",
};

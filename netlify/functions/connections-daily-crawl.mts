import { purgeCache, type Config } from "@netlify/functions";
import { alerting, alertCrawl } from "../../src/alert.ts";
import { crawlConnectionsDate, connectionsToday } from "../../src/connections/crawl.ts";

// Runs every day just after midnight IST (19:15 UTC). Also retries yesterday in case a run was missed.
// If CONNECTIONS_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default alerting("connections-daily-crawl", async () => {
  const outcomes = await Promise.all([crawlConnectionsDate(connectionsToday()), crawlConnectionsDate(connectionsToday(-1))]);
  console.log("[connections-daily-crawl]", JSON.stringify(outcomes));
  await alertCrawl("connections-daily-crawl", outcomes);

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["connections-index"] });
  }
});

export const config: Config = {
  schedule: "15 19 * * *",
};

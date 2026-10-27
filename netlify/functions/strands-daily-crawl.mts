import { purgeCache, type Config } from "@netlify/functions";
import { crawlStrandsDate, strandsToday } from "../../src/strands/crawl.ts";

// Runs every day just after midnight IST (19:15 UTC). Also retries yesterday in case a run was missed.
// If STRANDS_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default async () => {
  const outcomes = await Promise.all([crawlStrandsDate(strandsToday()), crawlStrandsDate(strandsToday(-1))]);
  console.log("[strands-daily-crawl]", JSON.stringify(outcomes));

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["strands-index"] });
  }
};

export const config: Config = {
  schedule: "15 0,19 * * *",
};

import { purgeCache, type Config } from "@netlify/functions";
import { crawlMiniDate, miniToday } from "../../src/mini-crossword/crawl.ts";

// Runs every day just after midnight IST (19:15 UTC). Also retries yesterday in case a run was missed.
// If MINI_CROSSWORD_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default async () => {
  const outcomes = await Promise.all([crawlMiniDate(miniToday()), crawlMiniDate(miniToday(-1))]);
  console.log("[mini-crossword-daily-crawl]", JSON.stringify(outcomes));

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["mini-crossword-index"] });
  }
};

export const config: Config = {
  schedule: "15 0,19 * * *",
};

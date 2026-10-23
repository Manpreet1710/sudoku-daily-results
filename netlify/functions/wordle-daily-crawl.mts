import { purgeCache, type Config } from "@netlify/functions";
import { crawlWordleDate, wordleToday } from "../../src/wordle/crawl.ts";

// Runs every day just after midnight IST (19:10 UTC). Also retries yesterday in case a run was missed.
// If WORDLE_TIMEZONE changes, move this schedule to just after midnight in that timezone.
export default async () => {
  const outcomes = await Promise.all([crawlWordleDate(wordleToday()), crawlWordleDate(wordleToday(-1))]);
  console.log("[wordle-daily-crawl]", JSON.stringify(outcomes));

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["wordle-index"] });
  }
};

export const config: Config = {
  schedule: "10 19 * * *",
};

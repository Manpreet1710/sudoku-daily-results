import { purgeCache, type Config } from "@netlify/functions";
import { crawlDate, todayIn } from "../../src/crawl.ts";

// Runs every day just after midnight IST (19:05 UTC), when sudoku.com's new
// Daily Challenge goes live. Also retries yesterday in case a run was missed.
export default async () => {
  const outcomes = await Promise.all([crawlDate(todayIn()), crawlDate(todayIn(undefined, -1))]);
  console.log("[daily-crawl]", JSON.stringify(outcomes));

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["sudoku-index"] });
  }
};

export const config: Config = {
  schedule: "5 19 * * *",
};

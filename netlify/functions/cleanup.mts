import type { Config } from "@netlify/functions";
import { alerting } from "../../src/alert.ts";
import { deleteOldResults, purgeDeleted } from "../../src/retention.ts";

// Keeps only the last RETENTION_DAYS (default 30) days of results in every game's blob store.
export default alerting("cleanup", async () => {
  const reports = await deleteOldResults();
  console.log("[cleanup]", JSON.stringify(reports.map((r) => ({ game: r.game, kept: r.kept, deleted: r.deleted.length }))));
  await purgeDeleted(reports);
});

export const config: Config = {
  schedule: "30 20 * * *",
};

import type { Config } from "@netlify/functions";
import { alerting } from "../../src/alert.ts";
import { deleteOldResults, purgeDeleted } from "../../src/retention.ts";

// Deletes results older than RETENTION_DAYS from every game's blob store. Unset (the default) keeps everything.
export default alerting("cleanup", async () => {
  const reports = await deleteOldResults();
  console.log("[cleanup]", JSON.stringify(reports.map((r) => ({ game: r.game, kept: r.kept, deleted: r.deleted.length }))));
  await purgeDeleted(reports);
});

export const config: Config = {
  schedule: "30 20 * * *",
};

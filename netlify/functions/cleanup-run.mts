import type { Config } from "@netlify/functions";
import { deleteOldResults, purgeDeleted } from "../../src/retention.ts";

// Manual trigger, protected by CRAWL_SECRET. Add ?dry=1 to only list what would be deleted:
//   curl -X POST -H "Authorization: Bearer $CRAWL_SECRET" "https://<site>/api/cleanup?dry=1"
export default async (req: Request) => {
  const secret = process.env.CRAWL_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(req.url).searchParams.get("dry") === "1";
  const reports = await deleteOldResults({ dryRun });
  if (!dryRun) await purgeDeleted(reports);
  return Response.json({ dryRun, reports });
};

export const config: Config = {
  path: "/api/cleanup",
  method: "POST",
};

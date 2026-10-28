import { purgeCache, type Config } from "@netlify/functions";
import { crawlLinkedInQueensToday } from "../../src/linkedin-queens/crawl.ts";

// Manual trigger, protected by CRAWL_SECRET. LinkedIn only serves today's puzzle, so there is no date range:
//   curl -X POST -H "Authorization: Bearer $CRAWL_SECRET" "https://<site>/api/linkedin-queens/crawl?force=1"
export default async (req: Request) => {
  const secret = process.env.CRAWL_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const outcome = await crawlLinkedInQueensToday({ force: new URL(req.url).searchParams.get("force") === "1" });
  if (outcome.status === "saved") await purgeCache({ tags: ["linkedin-queens-index", `linkedin-queens-${outcome.date}`] });
  return Response.json({ outcomes: [outcome] });
};

export const config: Config = {
  path: "/api/linkedin-queens/crawl",
  method: "POST",
};

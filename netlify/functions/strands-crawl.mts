import { purgeCache, type Config } from "@netlify/functions";
import { isIsoDate, shiftDate } from "../../src/crawl.ts";
import { crawlStrandsDate, strandsToday } from "../../src/strands/crawl.ts";

const MAX_DAYS = 31;

// Manual trigger / backfill, protected by CRAWL_SECRET:
//   curl -X POST -H "Authorization: Bearer $CRAWL_SECRET" \
//     "https://<site>/api/strands/crawl?from=2026-10-01&to=2026-10-23&force=1"
export default async (req: Request) => {
  const secret = process.env.CRAWL_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get("to") ?? url.searchParams.get("date") ?? strandsToday();
  const from = url.searchParams.get("from") ?? to;
  const force = url.searchParams.get("force") === "1";
  if (!isIsoDate(from) || !isIsoDate(to) || from > to) {
    return Response.json({ error: "use ?date=YYYY-MM-DD or ?from=YYYY-MM-DD&to=YYYY-MM-DD" }, { status: 400 });
  }

  const dates: string[] = [];
  for (let d = from; d <= to && dates.length < MAX_DAYS; d = shiftDate(d, 1)) dates.push(d);

  const outcomes = [];
  for (let i = 0; i < dates.length; i += 4) {
    outcomes.push(...(await Promise.all(dates.slice(i, i + 4).map((d) => crawlStrandsDate(d, { force })))));
  }

  if (outcomes.some((o) => o.status === "saved")) {
    await purgeCache({ tags: ["strands-index", ...outcomes.filter((o) => o.status === "saved").map((o) => `strands-${o.date}`)] });
  }
  return Response.json({ outcomes, truncated: dates.length === MAX_DAYS && dates.at(-1) !== to });
};

export const config: Config = {
  path: "/api/strands/crawl",
  method: "POST",
};

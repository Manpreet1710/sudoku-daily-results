import { purgeCache, type Config } from "@netlify/functions";
import { crawlNytSudoku } from "../../src/nyt-sudoku/crawl.ts";

// Manual trigger, protected by CRAWL_SECRET. Saves the puzzles the NYT is serving right now:
//   curl -X POST -H "Authorization: Bearer $CRAWL_SECRET" "https://<site>/api/nyt-sudoku/crawl?force=1"
export default async (req: Request) => {
  const secret = process.env.CRAWL_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const outcome = await crawlNytSudoku({ force: new URL(req.url).searchParams.get("force") === "1" });
  if (outcome.status === "saved") await purgeCache({ tags: ["nyt-sudoku-index", `nyt-sudoku-${outcome.date}`] });
  return Response.json({ outcome });
};

export const config: Config = {
  path: "/api/nyt-sudoku/crawl",
  method: "POST",
};

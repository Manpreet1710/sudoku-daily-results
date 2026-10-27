import { purgeCache, type Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { addMiniSudokuPuzzle, miniSudokuToday } from "../../src/mini-sudoku/add.ts";

// LinkedIn Mini Sudoku has no public feed, so the day's clues are posted by hand, protected by CRAWL_SECRET:
//   curl -X POST -H "Authorization: Bearer $CRAWL_SECRET" \
//     "https://<site>/api/mini-sudoku/add?date=2026-10-27&puzzle=001003002005103502204601300100400300"
// `puzzle` is the 6x6 grid row by row; use 0 or . for empty cells. Add force=1 to replace a saved day.
export default async (req: Request) => {
  const secret = process.env.CRAWL_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? miniSudokuToday();
  const puzzle = url.searchParams.get("puzzle") ?? "";
  if (!isIsoDate(date)) return Response.json({ error: "use ?date=YYYY-MM-DD&puzzle=<36 cells>" }, { status: 400 });

  const outcome = await addMiniSudokuPuzzle(date, puzzle, { force: url.searchParams.get("force") === "1" });
  if (outcome.status === "saved") await purgeCache({ tags: ["mini-sudoku-index", `mini-sudoku-${date}`] });
  return Response.json(outcome, { status: outcome.status === "error" ? 400 : 200 });
};

export const config: Config = {
  path: "/api/mini-sudoku/add",
  method: "POST",
};

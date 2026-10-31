import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getNytSudokuResult, listNytSudokuDates } from "../../src/nyt-sudoku/store.ts";
import { NYT_SUDOKU_HOME, renderNytSudokuArchive, renderNytSudokuNotFound, renderNytSudokuResult } from "../../src/nyt-sudoku/render.ts";

const html = (body: string, tag: string, maxAge: number) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${maxAge}, stale-while-revalidate=60`,
      "Netlify-Cache-Tag": tag,
    },
  });

export default async (req: Request) => {
  const path = new URL(req.url).pathname.replace(/\/+$/, "") || "/";

  if (path === `${NYT_SUDOKU_HOME}/archive`) {
    return html(renderNytSudokuArchive(await listNytSudokuDates()), "nyt-sudoku-index", 3600);
  }

  const dates = await listNytSudokuDates();
  const requested = path.startsWith(`${NYT_SUDOKU_HOME}/`) ? path.slice(NYT_SUDOKU_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderNytSudokuNotFound(), "nyt-sudoku-index", 60);

  const r = await getNytSudokuResult(date);
  if (!r) return html(renderNytSudokuNotFound(date), "nyt-sudoku-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderNytSudokuResult(r, nav, isHome), isHome ? "nyt-sudoku-index" : `nyt-sudoku-index,nyt-sudoku-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with NYT_SUDOKU_HOME)
  path: ["/nyt-sudoku", "/nyt-sudoku/archive", "/nyt-sudoku/:date"],
  method: "GET",
};

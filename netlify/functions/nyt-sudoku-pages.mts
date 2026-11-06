import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getNytSudokuResult, listNytSudokuDates } from "../../src/nyt-sudoku/store.ts";
import { NYT_SUDOKU_HOME, NYT_SUDOKU_YESTERDAY, renderNytSudokuNotFound, renderNytSudokuResult } from "../../src/nyt-sudoku/render.ts";

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

  // Only two pages per game (today and yesterday); dated URLs and the old archive redirect to today
  if (path !== NYT_SUDOKU_HOME && path !== NYT_SUDOKU_YESTERDAY) return Response.redirect(new URL(NYT_SUDOKU_HOME, req.url), 301);

  const dates = await listNytSudokuDates();
  const isHome = path === NYT_SUDOKU_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderNytSudokuNotFound(), "nyt-sudoku-index", 60);

  const r = await getNytSudokuResult(date);
  if (!r) return html(renderNytSudokuNotFound(date), "nyt-sudoku-index", 60);

  const nav = isHome ? { newer: null, older: NYT_SUDOKU_YESTERDAY } : { newer: NYT_SUDOKU_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getNytSudokuResult) : [];
  return html(renderNytSudokuResult(r, nav, isHome, past), "nyt-sudoku-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with NYT_SUDOKU_HOME)
  path: ["/nyt-sudoku-hints-answers-today", "/nyt-sudoku-hints-answers-yesterday", "/nyt-sudoku-hints-answers-today/:date"],
  method: "GET",
};

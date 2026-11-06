import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getMiniSudokuResult, listMiniSudokuDates } from "../../src/mini-sudoku/store.ts";
import { MINI_SUDOKU_HOME, MINI_SUDOKU_YESTERDAY, renderMiniSudokuNotFound, renderMiniSudokuResult } from "../../src/mini-sudoku/render.ts";

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
  if (path !== MINI_SUDOKU_HOME && path !== MINI_SUDOKU_YESTERDAY) return Response.redirect(new URL(MINI_SUDOKU_HOME, req.url), 301);

  const dates = await listMiniSudokuDates();
  const isHome = path === MINI_SUDOKU_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderMiniSudokuNotFound(), "mini-sudoku-index", 60);

  const r = await getMiniSudokuResult(date);
  if (!r) return html(renderMiniSudokuNotFound(date), "mini-sudoku-index", 60);

  const nav = isHome ? { newer: null, older: MINI_SUDOKU_YESTERDAY } : { newer: MINI_SUDOKU_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getMiniSudokuResult) : [];
  return html(renderMiniSudokuResult(r, nav, isHome, past), "mini-sudoku-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with MINI_SUDOKU_HOME)
  path: ["/linkedin-mini-sudoku-answer-today", "/linkedin-mini-sudoku-answer-yesterday", "/linkedin-mini-sudoku-answer-today/:date"],
  method: "GET",
};

import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getMiniSudokuResult, listMiniSudokuDates } from "../../src/mini-sudoku/store.ts";
import { MINI_SUDOKU_HOME, renderMiniSudokuArchive, renderMiniSudokuNotFound, renderMiniSudokuResult } from "../../src/mini-sudoku/render.ts";

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

  if (path === `${MINI_SUDOKU_HOME}/archive`) {
    return html(renderMiniSudokuArchive(await listMiniSudokuDates()), "mini-sudoku-index", 3600);
  }

  const dates = await listMiniSudokuDates();
  const requested = path.startsWith(`${MINI_SUDOKU_HOME}/`) ? path.slice(MINI_SUDOKU_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderMiniSudokuNotFound(), "mini-sudoku-index", 60);

  const r = await getMiniSudokuResult(date);
  if (!r) return html(renderMiniSudokuNotFound(date), "mini-sudoku-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderMiniSudokuResult(r, nav, isHome), isHome ? "mini-sudoku-index" : `mini-sudoku-index,mini-sudoku-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with MINI_SUDOKU_HOME)
  path: ["/mini-sudoku", "/mini-sudoku/archive", "/mini-sudoku/:date"],
  method: "GET",
};

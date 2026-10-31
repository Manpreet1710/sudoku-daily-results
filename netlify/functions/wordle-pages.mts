import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getWordleResult, listWordleDates } from "../../src/wordle/store.ts";
import { WORDLE_HOME, renderWordleArchive, renderWordleNotFound, renderWordleResult } from "../../src/wordle/render.ts";

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

  if (path === `${WORDLE_HOME}/archive`) {
    return html(renderWordleArchive(await listWordleDates()), "wordle-index", 3600);
  }

  const dates = await listWordleDates();
  const requested = path.startsWith(`${WORDLE_HOME}/`) ? path.slice(WORDLE_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the sudoku pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderWordleNotFound(), "wordle-index", 60);

  const r = await getWordleResult(date);
  if (!r) return html(renderWordleNotFound(date), "wordle-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderWordleResult(r, nav, isHome), isHome ? "wordle-index" : `wordle-index,wordle-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with WORDLE_HOME)
  path: ["/today-wordle-answer", "/today-wordle-answer/archive", "/today-wordle-answer/:date"],
  method: "GET",
};

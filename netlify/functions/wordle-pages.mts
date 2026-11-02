import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getWordleResult, listWordleDates } from "../../src/wordle/store.ts";
import { WORDLE_HOME, WORDLE_YESTERDAY, renderWordleNotFound, renderWordleResult } from "../../src/wordle/render.ts";

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
  if (path !== WORDLE_HOME && path !== WORDLE_YESTERDAY) return Response.redirect(new URL(WORDLE_HOME, req.url), 301);

  const dates = await listWordleDates();
  const isHome = path === WORDLE_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderWordleNotFound(), "wordle-index", 60);

  const r = await getWordleResult(date);
  if (!r) return html(renderWordleNotFound(date), "wordle-index", 60);

  const nav = isHome ? { newer: null, older: WORDLE_YESTERDAY } : { newer: WORDLE_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getWordleResult) : [];
  return html(renderWordleResult(r, nav, isHome, past), "wordle-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with WORDLE_HOME)
  path: ["/todays-wordle-answer", "/yesterdays-wordle-answer", "/todays-wordle-answer/:date"],
  method: "GET",
};

import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getSpellingBeeResult, listSpellingBeeDates } from "../../src/spelling-bee/store.ts";
import { SPELLING_BEE_HOME, SPELLING_BEE_YESTERDAY, renderSpellingBeeNotFound, renderSpellingBeeResult } from "../../src/spelling-bee/render.ts";

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
  if (path !== SPELLING_BEE_HOME && path !== SPELLING_BEE_YESTERDAY) return Response.redirect(new URL(SPELLING_BEE_HOME, req.url), 301);

  const dates = await listSpellingBeeDates();
  const isHome = path === SPELLING_BEE_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderSpellingBeeNotFound(), "spelling-bee-index", 60);

  const r = await getSpellingBeeResult(date);
  if (!r) return html(renderSpellingBeeNotFound(date), "spelling-bee-index", 60);

  const nav = isHome ? { newer: null, older: SPELLING_BEE_YESTERDAY } : { newer: SPELLING_BEE_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getSpellingBeeResult) : [];
  return html(renderSpellingBeeResult(r, nav, isHome, past), "spelling-bee-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with SPELLING_BEE_HOME)
  path: ["/nyt-spelling-bee-answers-today", "/yesterdays-spelling-bee-answers", "/nyt-spelling-bee-answers-today/:date"],
  method: "GET",
};

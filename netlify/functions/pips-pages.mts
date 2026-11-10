import type { Config } from "@netlify/functions";
import { pageDate } from "../../src/crawl.ts";
import { loadHistory } from "../../src/history.ts";
import { getPipsResult, listPipsDates } from "../../src/pips/store.ts";
import { PIPS_HOME, PIPS_YESTERDAY, renderPipsNotFound, renderPipsResult } from "../../src/pips/render.ts";

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
  if (path !== PIPS_HOME && path !== PIPS_YESTERDAY) return Response.redirect(new URL(PIPS_HOME, req.url), 301);

  const dates = await listPipsDates();
  const isHome = path === PIPS_HOME;
  const date = pageDate(dates, isHome);
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderPipsNotFound(), "pips-index", 60);

  const r = await getPipsResult(date);
  if (!r) return html(renderPipsNotFound(date), "pips-index", 60);

  const nav = isHome ? { newer: null, older: PIPS_YESTERDAY } : { newer: PIPS_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getPipsResult) : [];
  return html(renderPipsResult(r, nav, isHome, past), "pips-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with PIPS_HOME)
  path: ["/nyt-pips-hints-answers-today", "/nyt-pips-hints-answers-yesterday", "/nyt-pips-hints-answers-today/:date"],
  method: "GET",
};

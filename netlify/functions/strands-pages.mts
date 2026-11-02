import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getStrandsResult, listStrandsDates } from "../../src/strands/store.ts";
import { STRANDS_HOME, STRANDS_YESTERDAY, renderStrandsNotFound, renderStrandsResult } from "../../src/strands/render.ts";

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
  if (path !== STRANDS_HOME && path !== STRANDS_YESTERDAY) return Response.redirect(new URL(STRANDS_HOME, req.url), 301);

  const dates = await listStrandsDates();
  const isHome = path === STRANDS_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderStrandsNotFound(), "strands-index", 60);

  const r = await getStrandsResult(date);
  if (!r) return html(renderStrandsNotFound(date), "strands-index", 60);

  const nav = isHome ? { newer: null, older: STRANDS_YESTERDAY } : { newer: STRANDS_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getStrandsResult) : [];
  return html(renderStrandsResult(r, nav, isHome, past), "strands-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with STRANDS_HOME)
  path: ["/strands", "/strands-yesterday", "/strands/:date"],
  method: "GET",
};

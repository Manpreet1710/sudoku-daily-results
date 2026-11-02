import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getQueensResult, listQueensDates } from "../../src/queens/store.ts";
import { QUEENS_HOME, QUEENS_YESTERDAY, renderQueensNotFound, renderQueensResult } from "../../src/queens/render.ts";

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
  if (path !== QUEENS_HOME && path !== QUEENS_YESTERDAY) return Response.redirect(new URL(QUEENS_HOME, req.url), 301);

  const dates = await listQueensDates();
  const isHome = path === QUEENS_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderQueensNotFound(), "queens-index", 60);

  const r = await getQueensResult(date);
  if (!r) return html(renderQueensNotFound(date), "queens-index", 60);

  const nav = isHome ? { newer: null, older: QUEENS_YESTERDAY } : { newer: QUEENS_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getQueensResult) : [];
  return html(renderQueensResult(r, nav, isHome, past), "queens-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with QUEENS_HOME)
  path: ["/queens-unlimited", "/queens-unlimited-yesterday", "/queens-unlimited/:date"],
  method: "GET",
};

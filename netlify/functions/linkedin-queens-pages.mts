import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getLinkedInQueensResult, listLinkedInQueensDates } from "../../src/linkedin-queens/store.ts";
import { LINKEDIN_QUEENS_HOME, LINKEDIN_QUEENS_YESTERDAY, renderLinkedInQueensNotFound, renderLinkedInQueensResult } from "../../src/linkedin-queens/render.ts";

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
  if (path !== LINKEDIN_QUEENS_HOME && path !== LINKEDIN_QUEENS_YESTERDAY) return Response.redirect(new URL(LINKEDIN_QUEENS_HOME, req.url), 301);

  const dates = await listLinkedInQueensDates();
  const isHome = path === LINKEDIN_QUEENS_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderLinkedInQueensNotFound(), "linkedin-queens-index", 60);

  const r = await getLinkedInQueensResult(date);
  if (!r) return html(renderLinkedInQueensNotFound(date), "linkedin-queens-index", 60);

  const nav = isHome ? { newer: null, older: LINKEDIN_QUEENS_YESTERDAY } : { newer: LINKEDIN_QUEENS_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getLinkedInQueensResult) : [];
  return html(renderLinkedInQueensResult(r, nav, isHome, past), "linkedin-queens-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with LINKEDIN_QUEENS_HOME)
  path: ["/linkedin-queens", "/linkedin-queens-yesterday", "/linkedin-queens/:date"],
  method: "GET",
};

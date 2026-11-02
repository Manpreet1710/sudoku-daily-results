import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getLinkedInTangoResult, listLinkedInTangoDates } from "../../src/linkedin-tango/store.ts";
import { LINKEDIN_TANGO_HOME, LINKEDIN_TANGO_YESTERDAY, renderLinkedInTangoNotFound, renderLinkedInTangoResult } from "../../src/linkedin-tango/render.ts";

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
  if (path !== LINKEDIN_TANGO_HOME && path !== LINKEDIN_TANGO_YESTERDAY) return Response.redirect(new URL(LINKEDIN_TANGO_HOME, req.url), 301);

  const dates = await listLinkedInTangoDates();
  const isHome = path === LINKEDIN_TANGO_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderLinkedInTangoNotFound(), "linkedin-tango-index", 60);

  const r = await getLinkedInTangoResult(date);
  if (!r) return html(renderLinkedInTangoNotFound(date), "linkedin-tango-index", 60);

  const nav = isHome ? { newer: null, older: LINKEDIN_TANGO_YESTERDAY } : { newer: LINKEDIN_TANGO_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getLinkedInTangoResult) : [];
  return html(renderLinkedInTangoResult(r, nav, isHome, past), "linkedin-tango-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with LINKEDIN_TANGO_HOME)
  path: ["/linkedin-tango", "/linkedin-tango-yesterday", "/linkedin-tango/:date"],
  method: "GET",
};

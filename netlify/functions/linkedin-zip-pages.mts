import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getLinkedInZipResult, listLinkedInZipDates } from "../../src/linkedin-zip/store.ts";
import { LINKEDIN_ZIP_HOME, LINKEDIN_ZIP_YESTERDAY, renderLinkedInZipNotFound, renderLinkedInZipResult } from "../../src/linkedin-zip/render.ts";

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
  if (path !== LINKEDIN_ZIP_HOME && path !== LINKEDIN_ZIP_YESTERDAY) return Response.redirect(new URL(LINKEDIN_ZIP_HOME, req.url), 301);

  const dates = await listLinkedInZipDates();
  const isHome = path === LINKEDIN_ZIP_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderLinkedInZipNotFound(), "linkedin-zip-index", 60);

  const r = await getLinkedInZipResult(date);
  if (!r) return html(renderLinkedInZipNotFound(date), "linkedin-zip-index", 60);

  const nav = isHome ? { newer: null, older: LINKEDIN_ZIP_YESTERDAY } : { newer: LINKEDIN_ZIP_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getLinkedInZipResult) : [];
  return html(renderLinkedInZipResult(r, nav, isHome, past), "linkedin-zip-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with LINKEDIN_ZIP_HOME)
  path: ["/linkedin-zip", "/linkedin-zip-yesterday", "/linkedin-zip/:date"],
  method: "GET",
};

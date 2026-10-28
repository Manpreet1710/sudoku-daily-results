import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getLinkedInZipResult, listLinkedInZipDates } from "../../src/linkedin-zip/store.ts";
import { LINKEDIN_ZIP_HOME, renderLinkedInZipArchive, renderLinkedInZipNotFound, renderLinkedInZipResult } from "../../src/linkedin-zip/render.ts";

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

  if (path === `${LINKEDIN_ZIP_HOME}/archive`) {
    return html(renderLinkedInZipArchive(await listLinkedInZipDates()), "linkedin-zip-index", 3600);
  }

  const dates = await listLinkedInZipDates();
  const requested = path.startsWith(`${LINKEDIN_ZIP_HOME}/`) ? path.slice(LINKEDIN_ZIP_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderLinkedInZipNotFound(), "linkedin-zip-index", 60);

  const r = await getLinkedInZipResult(date);
  if (!r) return html(renderLinkedInZipNotFound(date), "linkedin-zip-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderLinkedInZipResult(r, nav, isHome), isHome ? "linkedin-zip-index" : `linkedin-zip-index,linkedin-zip-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with LINKEDIN_ZIP_HOME)
  path: ["/linkedin-zip", "/linkedin-zip/archive", "/linkedin-zip/:date"],
  method: "GET",
};

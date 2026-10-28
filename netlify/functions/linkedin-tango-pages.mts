import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getLinkedInTangoResult, listLinkedInTangoDates } from "../../src/linkedin-tango/store.ts";
import { LINKEDIN_TANGO_HOME, renderLinkedInTangoArchive, renderLinkedInTangoNotFound, renderLinkedInTangoResult } from "../../src/linkedin-tango/render.ts";

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

  if (path === `${LINKEDIN_TANGO_HOME}/archive`) {
    return html(renderLinkedInTangoArchive(await listLinkedInTangoDates()), "linkedin-tango-index", 3600);
  }

  const dates = await listLinkedInTangoDates();
  const requested = path.startsWith(`${LINKEDIN_TANGO_HOME}/`) ? path.slice(LINKEDIN_TANGO_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderLinkedInTangoNotFound(), "linkedin-tango-index", 60);

  const r = await getLinkedInTangoResult(date);
  if (!r) return html(renderLinkedInTangoNotFound(date), "linkedin-tango-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderLinkedInTangoResult(r, nav, isHome), isHome ? "linkedin-tango-index" : `linkedin-tango-index,linkedin-tango-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with LINKEDIN_TANGO_HOME)
  path: ["/linkedin-tango", "/linkedin-tango/archive", "/linkedin-tango/:date"],
  method: "GET",
};

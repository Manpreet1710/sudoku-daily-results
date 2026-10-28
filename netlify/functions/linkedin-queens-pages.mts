import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getLinkedInQueensResult, listLinkedInQueensDates } from "../../src/linkedin-queens/store.ts";
import { LINKEDIN_QUEENS_HOME, renderLinkedInQueensArchive, renderLinkedInQueensNotFound, renderLinkedInQueensResult } from "../../src/linkedin-queens/render.ts";

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

  if (path === `${LINKEDIN_QUEENS_HOME}/archive`) {
    return html(renderLinkedInQueensArchive(await listLinkedInQueensDates()), "linkedin-queens-index", 3600);
  }

  const dates = await listLinkedInQueensDates();
  const requested = path.startsWith(`${LINKEDIN_QUEENS_HOME}/`) ? path.slice(LINKEDIN_QUEENS_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderLinkedInQueensNotFound(), "linkedin-queens-index", 60);

  const r = await getLinkedInQueensResult(date);
  if (!r) return html(renderLinkedInQueensNotFound(date), "linkedin-queens-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderLinkedInQueensResult(r, nav, isHome), isHome ? "linkedin-queens-index" : `linkedin-queens-index,linkedin-queens-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with LINKEDIN_QUEENS_HOME)
  path: ["/linkedin-queens", "/linkedin-queens/archive", "/linkedin-queens/:date"],
  method: "GET",
};

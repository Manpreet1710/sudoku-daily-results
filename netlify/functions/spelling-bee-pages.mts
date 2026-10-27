import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getSpellingBeeResult, listSpellingBeeDates } from "../../src/spelling-bee/store.ts";
import { SPELLING_BEE_HOME, renderSpellingBeeArchive, renderSpellingBeeNotFound, renderSpellingBeeResult } from "../../src/spelling-bee/render.ts";

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

  if (path === `${SPELLING_BEE_HOME}/archive`) {
    return html(renderSpellingBeeArchive(await listSpellingBeeDates()), "spelling-bee-index", 3600);
  }

  const dates = await listSpellingBeeDates();
  const requested = path.startsWith(`${SPELLING_BEE_HOME}/`) ? path.slice(SPELLING_BEE_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderSpellingBeeNotFound(), "spelling-bee-index", 60);

  const r = await getSpellingBeeResult(date);
  if (!r) return html(renderSpellingBeeNotFound(date), "spelling-bee-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderSpellingBeeResult(r, nav, isHome), isHome ? "spelling-bee-index" : `spelling-bee-index,spelling-bee-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with SPELLING_BEE_HOME)
  path: ["/spelling-bee", "/spelling-bee/archive", "/spelling-bee/:date"],
  method: "GET",
};

import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getPipsResult, listPipsDates } from "../../src/pips/store.ts";
import { PIPS_HOME, renderPipsArchive, renderPipsNotFound, renderPipsResult } from "../../src/pips/render.ts";

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

  if (path === `${PIPS_HOME}/archive`) {
    return html(renderPipsArchive(await listPipsDates()), "pips-index", 3600);
  }

  const dates = await listPipsDates();
  const requested = path.startsWith(`${PIPS_HOME}/`) ? path.slice(PIPS_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderPipsNotFound(), "pips-index", 60);

  const r = await getPipsResult(date);
  if (!r) return html(renderPipsNotFound(date), "pips-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderPipsResult(r, nav, isHome), isHome ? "pips-index" : `pips-index,pips-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with PIPS_HOME)
  path: ["/pips", "/pips/archive", "/pips/:date"],
  method: "GET",
};

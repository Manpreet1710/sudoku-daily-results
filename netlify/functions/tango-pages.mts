import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getTangoResult, listTangoDates } from "../../src/tango/store.ts";
import { TANGO_HOME, renderTangoArchive, renderTangoNotFound, renderTangoResult } from "../../src/tango/render.ts";

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

  if (path === `${TANGO_HOME}/archive`) {
    return html(renderTangoArchive(await listTangoDates()), "tango-index", 3600);
  }

  const dates = await listTangoDates();
  const requested = path.startsWith(`${TANGO_HOME}/`) ? path.slice(TANGO_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderTangoNotFound(), "tango-index", 60);

  const r = await getTangoResult(date);
  if (!r) return html(renderTangoNotFound(date), "tango-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderTangoResult(r, nav, isHome), isHome ? "tango-index" : `tango-index,tango-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with TANGO_HOME)
  path: ["/tango-unlimited", "/tango-unlimited/archive", "/tango-unlimited/:date"],
  method: "GET",
};

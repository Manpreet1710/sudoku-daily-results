import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getZipResult, listZipDates } from "../../src/zip/store.ts";
import { ZIP_HOME, renderZipArchive, renderZipNotFound, renderZipResult } from "../../src/zip/render.ts";

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

  if (path === `${ZIP_HOME}/archive`) {
    return html(renderZipArchive(await listZipDates()), "zip-index", 3600);
  }

  const dates = await listZipDates();
  const requested = path.startsWith(`${ZIP_HOME}/`) ? path.slice(ZIP_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderZipNotFound(), "zip-index", 60);

  const r = await getZipResult(date);
  if (!r) return html(renderZipNotFound(date), "zip-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderZipResult(r, nav, isHome), isHome ? "zip-index" : `zip-index,zip-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with ZIP_HOME)
  path: ["/zip", "/zip/archive", "/zip/:date"],
  method: "GET",
};

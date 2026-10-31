import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getQueensResult, listQueensDates } from "../../src/queens/store.ts";
import { QUEENS_HOME, renderQueensArchive, renderQueensNotFound, renderQueensResult } from "../../src/queens/render.ts";

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

  if (path === `${QUEENS_HOME}/archive`) {
    return html(renderQueensArchive(await listQueensDates()), "queens-index", 3600);
  }

  const dates = await listQueensDates();
  const requested = path.startsWith(`${QUEENS_HOME}/`) ? path.slice(QUEENS_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderQueensNotFound(), "queens-index", 60);

  const r = await getQueensResult(date);
  if (!r) return html(renderQueensNotFound(date), "queens-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderQueensResult(r, nav, isHome), isHome ? "queens-index" : `queens-index,queens-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with QUEENS_HOME)
  path: ["/queens-unlimited", "/queens-unlimited/archive", "/queens-unlimited/:date"],
  method: "GET",
};

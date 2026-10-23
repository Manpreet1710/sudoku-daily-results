import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getResult, listDates } from "../../src/store.ts";
import { listWordleDates } from "../../src/wordle/store.ts";
import { wordleSitemapPaths } from "../../src/wordle/render.ts";
import { listConnectionsDates } from "../../src/connections/store.ts";
import { connectionsSitemapPaths } from "../../src/connections/render.ts";
import { RESULT_PREFIX, renderArchive, renderNotFound, renderResult, renderSitemap, resultPath } from "../../src/render.ts";

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

  if (path === "/sitemap.xml") {
    const res = html(renderSitemap(await listDates(), [...wordleSitemapPaths(await listWordleDates()), ...connectionsSitemapPaths(await listConnectionsDates())]), "sudoku-index", 3600);
    res.headers.set("Content-Type", "application/xml; charset=utf-8");
    return res;
  }

  if (path === "/archive") {
    return html(renderArchive(await listDates()), "sudoku-index", 3600);
  }

  // Old URL scheme, kept so existing links and indexed pages still resolve
  const legacy = path.match(/^\/results\/([^/]+?)$/)?.[1];
  if (legacy) return Response.redirect(new URL(resultPath(legacy), req.url), 301);

  const dates = await listDates();
  const requested = path.startsWith(`${RESULT_PREFIX}/`) ? path.slice(RESULT_PREFIX.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as
  // "unhandled" and falls through to other routes.
  if (!date || !isIsoDate(date)) return html(renderNotFound(), "sudoku-index", 60);

  const r = await getResult(date);
  if (!r) return html(renderNotFound(date), "sudoku-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  // Home & latest page change when a new day is crawled; older pages are effectively immutable
  return html(renderResult(r, nav, isHome), isHome ? "sudoku-index" : `sudoku-index,sudoku-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  path: ["/", "/archive", "/sudoku-daily-result/:date", "/results/:date", "/sitemap.xml"],
  method: "GET",
};

import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getResult, listDates } from "../../src/store.ts";
import { listWordleDates } from "../../src/wordle/store.ts";
import { wordleSitemapPaths } from "../../src/wordle/render.ts";
import { listConnectionsDates } from "../../src/connections/store.ts";
import { connectionsSitemapPaths } from "../../src/connections/render.ts";
import { listSpellingBeeDates } from "../../src/spelling-bee/store.ts";
import { spellingBeeSitemapPaths } from "../../src/spelling-bee/render.ts";
import { listQueensDates } from "../../src/queens/store.ts";
import { queensSitemapPaths } from "../../src/queens/render.ts";
import { listTangoDates } from "../../src/tango/store.ts";
import { tangoSitemapPaths } from "../../src/tango/render.ts";
import { listStrandsDates } from "../../src/strands/store.ts";
import { strandsSitemapPaths } from "../../src/strands/render.ts";
import { listMiniDates } from "../../src/mini-crossword/store.ts";
import { miniSitemapPaths } from "../../src/mini-crossword/render.ts";
import { listMiniSudokuDates } from "../../src/mini-sudoku/store.ts";
import { miniSudokuSitemapPaths } from "../../src/mini-sudoku/render.ts";
import { listLinkedInQueensDates } from "../../src/linkedin-queens/store.ts";
import { linkedinQueensSitemapPaths } from "../../src/linkedin-queens/render.ts";
import { listLinkedInTangoDates } from "../../src/linkedin-tango/store.ts";
import { linkedinTangoSitemapPaths } from "../../src/linkedin-tango/render.ts";
import { listLinkedInZipDates } from "../../src/linkedin-zip/store.ts";
import { linkedinZipSitemapPaths } from "../../src/linkedin-zip/render.ts";
import { listZipDates } from "../../src/zip/store.ts";
import { zipSitemapPaths } from "../../src/zip/render.ts";
import { listPipsDates } from "../../src/pips/store.ts";
import { pipsSitemapPaths } from "../../src/pips/render.ts";
import { listNytSudokuDates } from "../../src/nyt-sudoku/store.ts";
import { nytSudokuSitemapPaths } from "../../src/nyt-sudoku/render.ts";
import { hubSitemapPaths } from "../../src/hub/render.ts";
import { wordSearchSitemapPaths } from "../../src/word-search/render.ts";
import { ARCHIVE_PATH, RESULT_PREFIX, renderArchive, renderNotFound, renderResult, renderSitemap, resultPath } from "../../src/render.ts";

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
    const res = html(renderSitemap(await listDates(), [...wordleSitemapPaths(await listWordleDates()), ...connectionsSitemapPaths(await listConnectionsDates()), ...spellingBeeSitemapPaths(await listSpellingBeeDates()), ...queensSitemapPaths(await listQueensDates()), ...tangoSitemapPaths(await listTangoDates()), ...strandsSitemapPaths(await listStrandsDates()), ...miniSitemapPaths(await listMiniDates()), ...miniSudokuSitemapPaths(await listMiniSudokuDates()), ...zipSitemapPaths(await listZipDates()), ...linkedinQueensSitemapPaths(await listLinkedInQueensDates()), ...linkedinTangoSitemapPaths(await listLinkedInTangoDates()), ...linkedinZipSitemapPaths(await listLinkedInZipDates()), ...pipsSitemapPaths(await listPipsDates()), ...nytSudokuSitemapPaths(await listNytSudokuDates()), ...wordSearchSitemapPaths(), ...hubSitemapPaths()]), "sudoku-index", 3600);
    res.headers.set("Content-Type", "application/xml; charset=utf-8");
    return res;
  }

  if (path === ARCHIVE_PATH) {
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
  path: ["/daily-sudoku", "/daily-sudoku/archive", "/daily-sudoku/:date", "/results/:date", "/sitemap.xml"],
  method: "GET",
};

import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
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
import { wordSearchSitemapPaths } from "../../src/word-search/render.ts";
import { RESULT_PREFIX, renderNotFound, renderResult, renderSitemap } from "../../src/render.ts";

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

  if (path === "/sitemap-games.xml") {
    const res = html(renderSitemap([...wordleSitemapPaths(), ...connectionsSitemapPaths(), ...spellingBeeSitemapPaths(), ...queensSitemapPaths(), ...tangoSitemapPaths(), ...strandsSitemapPaths(), ...miniSitemapPaths(), ...miniSudokuSitemapPaths(), ...zipSitemapPaths(), ...linkedinQueensSitemapPaths(), ...linkedinTangoSitemapPaths(), ...linkedinZipSitemapPaths(), ...pipsSitemapPaths(), ...nytSudokuSitemapPaths(), ...wordSearchSitemapPaths()]), "sudoku-index", 3600);
    res.headers.set("Content-Type", "application/xml; charset=utf-8");
    return res;
  }

  // Old URL scheme, kept so existing links and indexed pages still resolve
  if (/^\/results\/[^/]+$/.test(path)) return Response.redirect(new URL(RESULT_PREFIX, req.url), 301);

  // Only the today page per game; yesterday, dated URLs and the old archive redirect to today
  if (path !== RESULT_PREFIX) return Response.redirect(new URL(RESULT_PREFIX, req.url), 301);

  const dates = await listDates();
  const date = dates[0];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderNotFound(), "sudoku-index", 60);

  const r = await getResult(date);
  if (!r) return html(renderNotFound(date), "sudoku-index", 60);

  const nav = { newer: null, older: null };
  const past = await loadHistory(dates, date, getResult);
  return html(renderResult(r, nav, true, past), "sudoku-index", 3600);
};

export const config: Config = {
  path: ["/sudoku-answer-today", "/sudoku-answer-today/:date", "/results/:date", "/sitemap-games.xml"],
  method: "GET",
};

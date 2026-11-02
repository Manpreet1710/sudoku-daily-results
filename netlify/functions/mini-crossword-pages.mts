import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getMiniResult, listMiniDates } from "../../src/mini-crossword/store.ts";
import { MINI_CROSSWORD_HOME, renderMiniNotFound, renderMiniResult } from "../../src/mini-crossword/render.ts";

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

  // Only the today page per game; yesterday, dated URLs and the old archive redirect to today
  if (path !== MINI_CROSSWORD_HOME) return Response.redirect(new URL(MINI_CROSSWORD_HOME, req.url), 301);

  const dates = await listMiniDates();
  const date = dates[0];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderMiniNotFound(), "mini-crossword-index", 60);

  const r = await getMiniResult(date);
  if (!r) return html(renderMiniNotFound(date), "mini-crossword-index", 60);

  const nav = { newer: null, older: null };
  const past = await loadHistory(dates, date, getMiniResult);
  return html(renderMiniResult(r, nav, true, past), "mini-crossword-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with MINI_CROSSWORD_HOME)
  path: ["/mini-crossword-answers", "/mini-crossword-answers/:date"],
  method: "GET",
};

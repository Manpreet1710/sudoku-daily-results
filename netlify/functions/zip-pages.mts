import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getZipResult, listZipDates } from "../../src/zip/store.ts";
import { ZIP_HOME, renderZipNotFound, renderZipResult } from "../../src/zip/render.ts";

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
  if (path !== ZIP_HOME) return Response.redirect(new URL(ZIP_HOME, req.url), 301);

  const dates = await listZipDates();
  const date = dates[0];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderZipNotFound(), "zip-index", 60);

  const r = await getZipResult(date);
  if (!r) return html(renderZipNotFound(date), "zip-index", 60);

  const nav = { newer: null, older: null };
  const past = await loadHistory(dates, date, getZipResult);
  return html(renderZipResult(r, nav, true, past), "zip-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with ZIP_HOME)
  path: ["/zip-game-answers", "/zip-game-answers/:date"],
  method: "GET",
};

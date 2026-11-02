import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getTangoResult, listTangoDates } from "../../src/tango/store.ts";
import { TANGO_HOME, renderTangoNotFound, renderTangoResult } from "../../src/tango/render.ts";

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
  if (path !== TANGO_HOME) return Response.redirect(new URL(TANGO_HOME, req.url), 301);

  const dates = await listTangoDates();
  const date = dates[0];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderTangoNotFound(), "tango-index", 60);

  const r = await getTangoResult(date);
  if (!r) return html(renderTangoNotFound(date), "tango-index", 60);

  const nav = { newer: null, older: null };
  const past = await loadHistory(dates, date, getTangoResult);
  return html(renderTangoResult(r, nav, true, past), "tango-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with TANGO_HOME)
  path: ["/tango-game-answers", "/tango-game-answers/:date"],
  method: "GET",
};

import type { Config } from "@netlify/functions";
import { loadHistory } from "../../src/history.ts";
import { getConnectionsResult, listConnectionsDates } from "../../src/connections/store.ts";
import { CONNECTIONS_HOME, CONNECTIONS_YESTERDAY, renderConnectionsNotFound, renderConnectionsResult } from "../../src/connections/render.ts";

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

  // Only two pages per game (today and yesterday); dated URLs and the old archive redirect to today
  if (path !== CONNECTIONS_HOME && path !== CONNECTIONS_YESTERDAY) return Response.redirect(new URL(CONNECTIONS_HOME, req.url), 301);

  const dates = await listConnectionsDates();
  const isHome = path === CONNECTIONS_HOME;
  const date = dates[isHome ? 0 : 1];
  // Not-found is served as 200 + noindex: netlify dev treats a function 404 as "unhandled" and falls through
  if (!date) return html(renderConnectionsNotFound(), "connections-index", 60);

  const r = await getConnectionsResult(date);
  if (!r) return html(renderConnectionsNotFound(date), "connections-index", 60);

  const nav = isHome ? { newer: null, older: CONNECTIONS_YESTERDAY } : { newer: CONNECTIONS_HOME, older: null };
  const past = isHome ? await loadHistory(dates, date, getConnectionsResult) : [];
  return html(renderConnectionsResult(r, nav, isHome, past), "connections-index", 3600);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with CONNECTIONS_HOME)
  path: ["/connections-hint-today", "/connections-hint-yesterday", "/connections-hint-today/:date"],
  method: "GET",
};

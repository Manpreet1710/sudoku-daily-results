import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getConnectionsResult, listConnectionsDates } from "../../src/connections/store.ts";
import { CONNECTIONS_HOME, renderConnectionsArchive, renderConnectionsNotFound, renderConnectionsResult } from "../../src/connections/render.ts";

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

  if (path === `${CONNECTIONS_HOME}/archive`) {
    return html(renderConnectionsArchive(await listConnectionsDates()), "connections-index", 3600);
  }

  const dates = await listConnectionsDates();
  const requested = path.startsWith(`${CONNECTIONS_HOME}/`) ? path.slice(CONNECTIONS_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderConnectionsNotFound(), "connections-index", 60);

  const r = await getConnectionsResult(date);
  if (!r) return html(renderConnectionsNotFound(date), "connections-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderConnectionsResult(r, nav, isHome), isHome ? "connections-index" : `connections-index,connections-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with CONNECTIONS_HOME)
  path: ["/connections", "/connections/archive", "/connections/:date"],
  method: "GET",
};

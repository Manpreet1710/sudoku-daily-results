import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getMiniResult, listMiniDates } from "../../src/mini-crossword/store.ts";
import { MINI_CROSSWORD_HOME, renderMiniArchive, renderMiniNotFound, renderMiniResult } from "../../src/mini-crossword/render.ts";

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

  if (path === `${MINI_CROSSWORD_HOME}/archive`) {
    return html(renderMiniArchive(await listMiniDates()), "mini-crossword-index", 3600);
  }

  const dates = await listMiniDates();
  const requested = path.startsWith(`${MINI_CROSSWORD_HOME}/`) ? path.slice(MINI_CROSSWORD_HOME.length + 1) : undefined;
  const date = requested ?? dates[0];
  // Not-found is served as 200 + noindex, same as the other pages (netlify dev falls through on 404)
  if (!date || !isIsoDate(date)) return html(renderMiniNotFound(), "mini-crossword-index", 60);

  const r = await getMiniResult(date);
  if (!r) return html(renderMiniNotFound(date), "mini-crossword-index", 60);

  const i = dates.indexOf(date);
  const nav = { newer: i > 0 ? dates[i - 1] : null, older: i >= 0 && i < dates.length - 1 ? dates[i + 1] : null };
  const isHome = !requested;
  return html(renderMiniResult(r, nav, isHome), isHome ? "mini-crossword-index" : `mini-crossword-index,mini-crossword-${date}`, isHome ? 3600 : 86400 * 30);
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with MINI_CROSSWORD_HOME)
  path: ["/mini-crossword", "/mini-crossword/archive", "/mini-crossword/:date"],
  method: "GET",
};

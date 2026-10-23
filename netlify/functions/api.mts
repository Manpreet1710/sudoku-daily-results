import type { Config } from "@netlify/functions";
import { isIsoDate } from "../../src/crawl.ts";
import { getResult, listDates } from "../../src/store.ts";

const cacheHeaders = (tag: string, maxAge: number) => ({
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${maxAge}, stale-while-revalidate=60`,
  "Netlify-Cache-Tag": tag,
  "Access-Control-Allow-Origin": "*",
});

export default async (req: Request) => {
  const date = new URL(req.url).pathname.match(/^\/api\/results\/([^/]+?)\/?$/)?.[1];

  if (!date) {
    return Response.json({ dates: await listDates() }, { headers: cacheHeaders("sudoku-index", 3600) });
  }
  if (!isIsoDate(date)) return Response.json({ error: "bad date" }, { status: 400 });

  const r = await getResult(date);
  if (!r) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(r, { headers: cacheHeaders(`sudoku-${date}`, 86400 * 30) });
};

export const config: Config = {
  path: ["/api/results", "/api/results/:date"],
  method: "GET",
};

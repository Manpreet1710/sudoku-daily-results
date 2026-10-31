import type { Config } from "@netlify/functions";
import { renderWordSearch } from "../../src/word-search/render.ts";

// Static page: the game runs entirely in the browser, so there is nothing to store or crawl.
export default async () =>
  new Response(renderWordSearch(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=86400, stale-while-revalidate=60",
    },
  });

export const config: Config = {
  path: "/word-search",
  method: "GET",
};

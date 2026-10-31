import type { Config } from "@netlify/functions";
import { renderHome } from "../../src/home/render.ts";
import { latestDates } from "../../src/hub/latest.ts";

// The landing page: every category and game, with each game's most recent saved day.
export default async () =>
  new Response(renderHome(await latestDates("nyt", "linkedin", "more")), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=900, stale-while-revalidate=60",
    },
  });

export const config: Config = {
  path: "/",
  method: "GET",
};

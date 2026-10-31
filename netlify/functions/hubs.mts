import type { Config } from "@netlify/functions";
import { LINKEDIN_HUB, MORE_HUB, renderHub, type HubKind } from "../../src/hub/render.ts";
import { latestDates } from "../../src/hub/latest.ts";

export default async (req: Request) => {
  const path = new URL(req.url).pathname.replace(/\/+$/, "");
  const kind: HubKind = path === LINKEDIN_HUB ? "linkedin" : path === MORE_HUB ? "more" : "nyt";

  return new Response(renderHub(kind, await latestDates(kind)), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Netlify-CDN-Cache-Control": "public, durable, s-maxage=900, stale-while-revalidate=60",
    },
  });
};

export const config: Config = {
  // Literal strings only: Netlify reads this statically (keep in sync with NYT_HUB / LINKEDIN_HUB / MORE_HUB)
  path: ["/nyt-games-solver", "/linkedin-games-solver", "/puzzle-games-solver"],
  method: "GET",
};

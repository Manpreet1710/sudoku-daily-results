// Fetches the daily Tango board from tango-unlimited.com's own JSON endpoint
// (not an official public API). The board is generated from a date-derived seed
// and comes without a solution, so the answer is computed by our own solver.
//
// Board string: 36 cells ("." empty, "O" sun, "X" moon), then 36 markers for the edge
// to the cell on the right and 36 for the edge to the cell below ("." none, "=" same, "x" different).

export interface TangoSource {
  board: string; // 108 characters
  tier: string; // the site's own difficulty label, e.g. "easy"
  generatorVersion: string;
}

const BASE = "https://www.tango-unlimited.com/api/random";
const UA = "Mozilla/5.0 (compatible; TangoResultsBot/1.0)";

export const tangoSeed = (isoDate: string) => `t2d${isoDate.replaceAll("-", "")}`;

// Unlike the page itself, the endpoint will happily generate a board for any date,
// including the future, so callers must guard against publishing early.
export async function fetchTango(isoDate: string): Promise<TangoSource> {
  const url = `${BASE}/${tangoSeed(isoDate)}?difficulty=daily`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`tango-unlimited.com responded ${res.status} for ${url}`);

  const j = await res.json();
  if (typeof j?.board !== "string" || !/^[.OX]{36}[.=x]{72}$/.test(j.board)) {
    throw new Error(`Unexpected payload from ${url}: ${JSON.stringify(j).slice(0, 200)}`);
  }
  return { board: j.board, tier: String(j.tier ?? ""), generatorVersion: String(j.generatorVersion ?? "") };
}

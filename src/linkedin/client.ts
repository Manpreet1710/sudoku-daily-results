// Reads the current puzzle of a LinkedIn game through the guest GraphQL endpoint, the same call the game page
// makes for a signed-out visitor. It is not an official public API: it only ever serves the current puzzle, and
// the queryId can change when LinkedIn redeploys (set LINKEDIN_GAMES_QUERY_ID to follow it).

// Game type ids on LinkedIn's endpoint
export const LINKEDIN_GAME = { queens: 3, tango: 5, zip: 6, miniSudoku: 7 } as const;

const UA = "Mozilla/5.0 (compatible; PuzzleResultsBot/1.0)";
const QUERY_ID = process.env.LINKEDIN_GAMES_QUERY_ID || process.env.LINKEDIN_MINI_SUDOKU_QUERY_ID || "voyagerIdentityDashGames.22685dd4999129d6bed79f33e65dcbc5";

export interface LinkedInGame {
  puzzleId: number;
  puzzle: any; // the game-specific puzzle object, e.g. queensGamePuzzle
}

export async function fetchLinkedInGame(gameTypeId: number, puzzleKey: string, slug: string): Promise<LinkedInGame> {
  // A signed-out visit hands out a session cookie; its JSESSIONID doubles as the csrf-token header
  const page = await fetch(`https://www.linkedin.com/games/view/${slug}/desktop`, { headers: { "User-Agent": UA } });
  if (!page.ok) throw new Error(`linkedin.com responded ${page.status} for the game page`);
  const cookies = page.headers.getSetCookie().map((c) => c.split(";")[0]);
  const csrf = cookies.find((c) => c.startsWith("JSESSIONID="))?.slice("JSESSIONID=".length).replace(/"/g, "");
  if (!csrf) throw new Error("linkedin.com did not start a guest session");

  const url = `https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(gameTypeId:${gameTypeId})&queryId=${QUERY_ID}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/vnd.linkedin.normalized+json+2.1", "csrf-token": csrf, Cookie: cookies.join("; ") },
  });
  if (!res.ok) throw new Error(`linkedin.com responded ${res.status} for the puzzle call (the queryId may have changed)`);

  const j = await res.json();
  const game = (j?.included as any[] | undefined)?.find((x) => x?.gameTypeId === gameTypeId && x.gamePuzzle?.[puzzleKey]);
  if (!game) throw new Error(`Unexpected payload from linkedin.com: no ${puzzleKey}`);
  return { puzzleId: Number(game.puzzleId), puzzle: game.gamePuzzle[puzzleKey] };
}

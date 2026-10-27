// Fetches the Strands puzzle for a date from the New York Times' JSON endpoint
// (the same one the Strands page calls). It is not an official public API.
// The payload has the letter board, the theme words and the spangram, but not where they sit.

export interface StrandsSource {
  id: number;
  editor: string;
  clue: string;
  board: string[]; // 8 rows of 6 uppercase letters
  spangram: string;
  themeWords: string[]; // without the spangram
}

export const STRANDS_ROWS = 8;
export const STRANDS_COLS = 6;

const BASE = "https://www.nytimes.com/svc/strands/v2";
const UA = "Mozilla/5.0 (compatible; StrandsResultsBot/1.0)";

export async function fetchStrands(isoDate: string): Promise<StrandsSource | null> {
  const url = `${BASE}/${isoDate}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`nytimes.com responded ${res.status} for ${url}`);

  const j = await res.json();
  const bad = () => new Error(`Unexpected payload from ${url}: ${JSON.stringify(j).slice(0, 200)}`);
  const isWord = (w: unknown): w is string => typeof w === "string" && /^[A-Z]{3,48}$/.test(w);
  if (j?.status !== "OK" || j.printDate !== isoDate || !isWord(j.spangram) || !Array.isArray(j.themeWords) || !j.themeWords.every(isWord)) throw bad();
  if (!Array.isArray(j.startingBoard) || j.startingBoard.length !== STRANDS_ROWS || !j.startingBoard.every((r: unknown) => typeof r === "string" && /^[A-Z]{6}$/.test(r))) throw bad();

  return {
    id: Number(j.id),
    editor: String(j.editor ?? ""),
    clue: String(j.clue ?? ""),
    board: j.startingBoard,
    spangram: j.spangram,
    themeWords: j.themeWords,
  };
}

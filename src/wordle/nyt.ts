// Fetches the Wordle answer for a date from the New York Times' JSON endpoint
// (the same one the Wordle page calls). It is not an official public API.

export interface WordleSource {
  number: number; // Wordle #, i.e. days since launch
  solution: string; // lowercase, 5 letters
  editor: string;
}

const BASE = "https://www.nytimes.com/svc/wordle/v2";
const UA = "Mozilla/5.0 (compatible; WordleResultsBot/1.0)";

export async function fetchWordleAnswer(isoDate: string): Promise<WordleSource | null> {
  const url = `${BASE}/${isoDate}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`nytimes.com responded ${res.status} for ${url}`);

  const j = await res.json();
  if (typeof j?.solution !== "string" || !/^[a-z]{5}$/i.test(j.solution) || !Number.isInteger(j.days_since_launch) || j.print_date !== isoDate) {
    throw new Error(`Unexpected payload from ${url}: ${JSON.stringify(j).slice(0, 200)}`);
  }
  return { number: j.days_since_launch, solution: j.solution.toLowerCase(), editor: String(j.editor ?? "") };
}

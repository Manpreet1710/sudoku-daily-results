// Fetches the Spelling Bee puzzle for a date from the New York Times' JSON endpoint
// (not an official public API; note it is v1, unlike the Wordle and Connections endpoints).

export interface SpellingBeeSource {
  id: number;
  center: string; // lowercase letter
  outer: string[]; // the six other letters, lowercase
  pangrams: string[];
  answers: string[]; // every valid word, includes the pangrams
  editor: string;
}

const BASE = "https://www.nytimes.com/svc/spelling-bee/v1";
const UA = "Mozilla/5.0 (compatible; SpellingBeeResultsBot/1.0)";

export async function fetchSpellingBee(isoDate: string): Promise<SpellingBeeSource | null> {
  const url = `${BASE}/${isoDate}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`nytimes.com responded ${res.status} for ${url}`);

  const j = await res.json();
  const words = (v: unknown) => Array.isArray(v) && v.length > 0 && v.every((w) => typeof w === "string" && /^[a-z]{4,}$/.test(w));
  if (
    typeof j?.center_letter !== "string" || !/^[a-z]$/.test(j.center_letter) ||
    typeof j.outer_letters !== "string" || !/^[a-z]{6}$/.test(j.outer_letters) ||
    !words(j.pangrams) || !words(j.answers) || !Number.isInteger(j.id) || j.print_date !== isoDate
  ) {
    throw new Error(`Unexpected payload from ${url}: ${JSON.stringify(j).slice(0, 200)}`);
  }
  return { id: j.id, center: j.center_letter, outer: [...j.outer_letters], pangrams: j.pangrams, answers: j.answers, editor: String(j.editor ?? "") };
}

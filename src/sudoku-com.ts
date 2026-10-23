// Fetches the Daily Challenge board from sudoku.com's public game API
// (the same endpoint the site's own JS calls when you open a daily puzzle).

export interface SourcePuzzle {
  id: string;
  mission: string;
  solution: string;
  difficulty: string;
  winRate: number;
  apiUrl: string;
}

const BASE = "https://sudoku.com";
const UA = "Mozilla/5.0 (compatible; SudokuResultsBot/1.0)";

// sudoku.com uses non-padded month/day: 2026-1-5
const apiDate = (iso: string) =>
  iso
    .split("-")
    .map((p) => String(parseInt(p, 10)))
    .join("-");

export async function fetchDailyChallenge(isoDate: string): Promise<SourcePuzzle | null> {
  const apiUrl = `${BASE}/api/dc/${apiDate(isoDate)}?v=2`;
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `${BASE}/challenges/daily-sudoku`,
    },
  });
  // 204 = puzzle for that date isn't published yet
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`sudoku.com responded ${res.status} for ${apiUrl}`);

  const j = await res.json();
  if (typeof j?.mission !== "string" || !/^\d{81}$/.test(j.mission)) {
    throw new Error(`Unexpected payload from ${apiUrl}: ${JSON.stringify(j).slice(0, 200)}`);
  }
  return {
    id: String(j.id),
    mission: j.mission,
    solution: j.solution ?? "",
    difficulty: j.difficulty ?? "unknown",
    winRate: Number(j.win_rate ?? 0),
    apiUrl,
  };
}

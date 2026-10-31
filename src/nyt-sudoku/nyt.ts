// Reads today's NYT Sudoku puzzles (easy, medium, hard) from the data the NYT Sudoku page embeds in its HTML
// (`window.gameData`). It only ever holds the current day, and it is not an official public API.

export type NytLevel = "easy" | "medium" | "hard";
export const NYT_LEVELS: NytLevel[] = ["easy", "medium", "hard"];

export interface NytSudokuPuzzle {
  id: number;
  puzzle: string; // 81 digits, 0 = blank
  solution: string; // 81 digits, NYT's own answer (used only to cross-check our solver)
}

export interface NytSudokuSource {
  date: string; // YYYY-MM-DD, the NYT print date
  levels: Record<NytLevel, NytSudokuPuzzle>;
}

const URL_ = "https://www.nytimes.com/puzzles/sudoku";
const UA = "Mozilla/5.0 (compatible; NytSudokuResultsBot/1.0)";

const is81 = (a: unknown): a is number[] => Array.isArray(a) && a.length === 81 && a.every((n) => Number.isInteger(n) && n >= 0 && n <= 9);

export function parseGameData(html: string): NytSudokuSource {
  const m = html.match(/window\.gameData\s*=\s*(\{.*?\})\s*;?\s*<\/script>/s);
  if (!m) throw new Error("window.gameData not found on the NYT Sudoku page");
  const j = JSON.parse(m[1]);

  const levels = {} as Record<NytLevel, NytSudokuPuzzle>;
  let date = "";
  for (const l of NYT_LEVELS) {
    const p = j[l];
    const data = p?.puzzle_data;
    if (!p || !is81(data?.puzzle) || !is81(data?.solution) || !/^\d{4}-\d{2}-\d{2}$/.test(p.print_date)) {
      throw new Error(`Unexpected NYT Sudoku payload for ${l}: ${JSON.stringify(p).slice(0, 200)}`);
    }
    if (date && p.print_date !== date) throw new Error(`NYT Sudoku levels disagree on the date (${date} vs ${p.print_date})`);
    date = p.print_date;
    levels[l] = { id: Number(p.puzzle_id), puzzle: data.puzzle.join(""), solution: data.solution.join("") };
  }
  return { date, levels };
}

export async function fetchNytSudoku(): Promise<NytSudokuSource> {
  const res = await fetch(URL_, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`nytimes.com responded ${res.status} for ${URL_}`);
  return parseGameData(await res.text());
}

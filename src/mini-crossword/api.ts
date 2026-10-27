// Fetches the daily Mini Crossword for a date from the JSON API behind minicrossword.com
// (an ipuz-style payload that includes the filled grid). It is not an official public API.

export type MiniLevel = "easy" | "hard";

export interface MiniEntry {
  number: number;
  clue: string;
  hint: string; // the site's own gentler clue, empty when it has none
  answer: string;
  row: number; // 0-based start cell
  col: number;
}

export interface MiniPuzzle {
  level: MiniLevel;
  title: string;
  byline: string;
  size: number;
  blocks: boolean[]; // row-major, true for black squares
  numbers: Record<number, number>; // cell index -> clue number
  across: MiniEntry[];
  down: MiniEntry[];
}

// Day 1 of the site's daily series; the API addresses puzzles by day number
export const MINI_FIRST_DATE = "2026-06-22";
const BASE = "https://play.hey.gg/api/crosswords/minicrossword/daily";
const UA = "Mozilla/5.0 (compatible; MiniCrosswordResultsBot/1.0)";

export const miniDayNumber = (isoDate: string) => Math.round((Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${MINI_FIRST_DATE}T00:00:00Z`)) / 864e5) + 1;

// Clues arrive either as {number, clue, hints[]} or as a [number, text, hint?] tuple
function clueOf(c: any): { number: number; clue: string; hint: string } | null {
  if (Array.isArray(c)) return typeof c[0] === "number" && typeof c[1] === "string" ? { number: c[0], clue: c[1], hint: typeof c[2] === "string" ? c[2] : "" } : null;
  return typeof c?.number === "number" && typeof c.clue === "string" ? { number: c.number, clue: c.clue, hint: typeof c.hints?.[0] === "string" ? c.hints[0] : "" } : null;
}

function parse(j: any, level: MiniLevel, url: string): MiniPuzzle {
  const bad = (why: string) => new Error(`Unexpected payload from ${url}: ${why}`);
  const size = j?.dimensions?.width;
  if (!Number.isInteger(size) || size < 3 || size > 15 || j.dimensions.height !== size) throw bad("dimensions");
  const sol: unknown = j.solution;
  if (!Array.isArray(sol) || sol.length !== size || !sol.every((r) => Array.isArray(r) && r.length === size)) throw bad("solution grid");

  const letter = (r: number, c: number) => {
    const v = (sol as (string | null)[][])[r]?.[c];
    return typeof v === "string" && /^[A-Za-z]+$/.test(v) ? v.toUpperCase() : null; // a rebus square holds several letters
  };
  const white = (r: number, c: number) => r >= 0 && c >= 0 && r < size && c < size && letter(r, c) !== null;

  // Our own numbering from the filled grid: a square starts an entry when it has a white square after it and none before
  const numbers: Record<number, number> = {};
  const starts: { n: number; r: number; c: number; across: boolean; down: boolean }[] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (!white(r, c)) continue;
      const across = !white(r, c - 1) && white(r, c + 1);
      const down = !white(r - 1, c) && white(r + 1, c);
      if (across || down) {
        numbers[r * size + c] = starts.length + 1;
        starts.push({ n: starts.length + 1, r, c, across, down });
      }
    }
  // The site's own number grid must agree with it, or the clue numbers cannot be trusted
  const theirs = new Map<number, number>();
  (j.puzzle as unknown[][])?.forEach((row, r) => row.forEach((v, c) => typeof v === "number" && v > 0 && theirs.set(r * size + c, v)));
  if (theirs.size !== starts.length || starts.some((s) => theirs.get(s.r * size + s.c) !== s.n)) throw bad("clue numbers do not match the grid");

  const entries = (dir: "Across" | "Down"): MiniEntry[] => {
    const list = (j.clues?.[dir] as unknown[] | undefined)?.map(clueOf);
    const wanted = starts.filter((s) => (dir === "Across" ? s.across : s.down));
    if (!list || list.length !== wanted.length || list.some((c) => !c)) throw bad(`${dir} clues`);
    return wanted.map((s, i) => {
      const c = list[i]!;
      if (c.number !== s.n) throw bad(`${dir} clue ${c.number} is out of order`);
      let answer = "";
      for (let r = s.r, k = s.c; ; dir === "Across" ? k++ : r++) {
        const ch = letter(dir === "Across" ? s.r : r, dir === "Across" ? k : s.c);
        if (!ch) break;
        answer += ch;
      }
      return { number: s.n, clue: c.clue, hint: c.hint, answer, row: s.r, col: s.c };
    });
  };

  return {
    level,
    title: String(j.title ?? ""),
    byline: String(j.byline ?? j.author ?? ""),
    size,
    blocks: Array.from({ length: size * size }, (_, i) => !white(Math.floor(i / size), i % size)),
    numbers,
    across: entries("Across"),
    down: entries("Down"),
  };
}

export async function fetchMiniPuzzle(isoDate: string, level: MiniLevel): Promise<MiniPuzzle | null> {
  const day = miniDayNumber(isoDate);
  if (day < 1) return null;
  const url = `${BASE}/${level}/${day}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`play.hey.gg responded ${res.status} for ${url}`);
  return parse(await res.json(), level, url);
}

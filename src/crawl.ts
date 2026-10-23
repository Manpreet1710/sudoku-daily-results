import { solve } from "./solver.ts";
import { fetchDailyChallenge } from "./sudoku-com.ts";
import { getResult, saveResult, type DailyResult } from "./store.ts";

export const PUZZLE_TZ = process.env.PUZZLE_TIMEZONE || "Asia/Kolkata";

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

// Today's date (YYYY-MM-DD) in the timezone whose daily puzzle we track
export function todayIn(tz = PUZZLE_TZ, offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

export function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type CrawlOutcome = { date: string; status: "saved" | "exists" | "not-published" | "error"; detail?: string };

export async function crawlDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    if (!force && (await getResult(date))) return { date, status: "exists" };

    const src = await fetchDailyChallenge(date);
    if (!src) return { date, status: "not-published" };

    const result = solve(src.mission);
    if (!result.solved) return { date, status: "error", detail: "solver could not solve puzzle" };

    const record: DailyResult = {
      date,
      source: { site: "sudoku.com", id: src.id, difficulty: src.difficulty, winRate: src.winRate, apiUrl: src.apiUrl },
      puzzle: src.mission,
      result,
      matchesSource: !src.solution || src.solution === result.solution,
      crawledAt: new Date().toISOString(),
    };
    if (!record.matchesSource) console.warn(`[crawl] ${date}: our solution differs from sudoku.com's`);

    await saveResult(record);
    return { date, status: "saved", detail: `${result.rating}, ${result.steps.length} steps` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

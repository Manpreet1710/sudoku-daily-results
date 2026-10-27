import { todayIn, type CrawlOutcome } from "../crawl.ts";
import { fetchZip } from "./api.ts";
import { solveZip } from "./solver.ts";
import { getZipResult, saveZipResult } from "./store.ts";

export const ZIP_TZ = process.env.ZIP_TIMEZONE || "Asia/Kolkata";

export const zipToday = (offsetDays = 0) => todayIn(ZIP_TZ, offsetDays);

export async function crawlZipDate(date: string, { force = false } = {}): Promise<CrawlOutcome> {
  try {
    // The pick is computable for any date; never publish a puzzle before its day
    if (date > zipToday()) return { date, status: "not-published", detail: "future date" };
    if (!force && (await getZipResult(date))) return { date, status: "exists" };

    const src = await fetchZip(date);
    if (!src) return { date, status: "not-published", detail: "before the site's current puzzle pools" };

    const s = solveZip(src);
    // A wrong answer is worse than a missing page; the site's own path is the cross-check
    if (s.path.length !== src.size * src.size) throw new Error(`No solution found for ${src.id}`);
    if (s.path.some(([r, c], i) => r !== src.sitePath[i]?.[0] || c !== src.sitePath[i]?.[1])) throw new Error(`Our solution for ${src.id} differs from the site's`);

    await saveZipResult({ date, puzzleId: src.id, size: src.size, difficulty: src.difficulty, numbers: src.numbers, walls: src.walls, path: s.path, steps: s.steps, logical: s.logical, unique: s.unique, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: `${src.size}x${src.size} ${src.difficulty}` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

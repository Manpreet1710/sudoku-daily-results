import type { CrawlOutcome } from "../crawl.ts";
import { linkedinToday } from "../linkedin/date.ts";
import { solveZip } from "../zip/solver.ts";
import { fetchLinkedInZip } from "./api.ts";
import { getLinkedInZipResult, saveLinkedInZipResult } from "./store.ts";

// LinkedIn only serves the current puzzle, so this crawls "today" (Pacific time) and cannot backfill past days
export async function crawlLinkedInZipToday({ force = false } = {}): Promise<CrawlOutcome> {
  const date = linkedinToday();
  try {
    if (!force && (await getLinkedInZipResult(date))) return { date, status: "exists" };

    const src = await fetchLinkedInZip();
    const s = solveZip(src);
    // A wrong answer is worse than a missing page; LinkedIn's own path is the cross-check
    if (s.path.length !== src.size * src.size) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our solver found no solution` };
    if (s.path.some(([r, c], i) => r !== src.sitePath[i]?.[0] || c !== src.sitePath[i]?.[1])) return { date, status: "error", detail: `puzzle ${src.puzzleId}: our path differs from LinkedIn's` };

    await saveLinkedInZipResult({ date, puzzleId: src.puzzleId, size: src.size, numbers: src.numbers, walls: src.walls, path: s.path, steps: s.steps, logical: s.logical, unique: s.unique, crawledAt: new Date().toISOString() });
    return { date, status: "saved", detail: `#${src.puzzleId} ${src.size}x${src.size}` };
  } catch (e) {
    return { date, status: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}

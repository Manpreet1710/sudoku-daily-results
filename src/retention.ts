import { getStore } from "@netlify/blobs";
import { purgeCache } from "@netlify/functions";
import { shiftDate } from "./crawl.ts";

export const RETENTION_DAYS = Number(process.env.RETENTION_DAYS) || 30;

// Every game's blob store and the key prefix its dates live under (see each src/<game>/store.ts).
const STORES: { game: string; prefix: string }[] = [
  { game: "sudoku", prefix: "dc/" },
  { game: "wordle", prefix: "w/" },
  { game: "connections", prefix: "c/" },
  { game: "spelling-bee", prefix: "s/" },
  { game: "strands", prefix: "s/" },
  { game: "mini-crossword", prefix: "m/" },
  { game: "mini-sudoku", prefix: "m/" },
  { game: "queens", prefix: "q/" },
  { game: "tango", prefix: "t/" },
  { game: "zip", prefix: "z/" },
  { game: "linkedin-queens", prefix: "q/" },
  { game: "linkedin-tango", prefix: "t/" },
  { game: "linkedin-zip", prefix: "z/" },
];

export type RetentionReport = { game: string; kept: number; deleted: string[] };

// Deletes every saved day older than `days` days (the last `days` days, today included, are kept).
// `today` is the UTC date; a day of slack either way is irrelevant for a 30-day window.
export async function deleteOldResults({ days = RETENTION_DAYS, dryRun = false } = {}): Promise<RetentionReport[]> {
  const cutoff = shiftDate(new Date().toISOString().slice(0, 10), -(days - 1));
  const reports: RetentionReport[] = [];

  for (const { game, prefix } of STORES) {
    const store = getStore({ name: `${game}-results`, consistency: "strong" });
    const { blobs } = await store.list({ prefix });
    const dated = blobs.map((b) => ({ key: b.key, date: b.key.slice(prefix.length) }));
    const old = dated.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.date < cutoff);

    if (!dryRun) await Promise.all(old.map((d) => store.delete(d.key)));
    reports.push({ game, kept: dated.length - old.length, deleted: old.map((d) => d.date).sort() });
  }
  return reports;
}

// Drops the cached archive page of each game that lost days, and the cached page of every deleted day.
export async function purgeDeleted(reports: RetentionReport[]): Promise<void> {
  const tags = reports.flatMap((r) => (r.deleted.length ? [`${r.game}-index`, ...r.deleted.map((d) => `${r.game}-${d}`)] : []));
  for (let i = 0; i < tags.length; i += 100) await purgeCache({ tags: tags.slice(i, i + 100) });
}

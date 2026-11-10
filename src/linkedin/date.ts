import { PUZZLE_TZ, todayIn } from "../crawl.ts";

// LinkedIn rolls its games over at midnight Pacific time, so that is the date a puzzle belongs to
export const LINKEDIN_TZ = process.env.LINKEDIN_TIMEZONE || "America/Los_Angeles";

export const linkedinToday = (offsetDays = 0) => todayIn(LINKEDIN_TZ, offsetDays);

// Our pages date every game in PUZZLE_TZ. Ahead of Pacific time, the puzzle LinkedIn still serves after local
// midnight carries the previous Pacific date, so the today/yesterday pages show it one day later.
export function linkedinPageDate(date: string, isHome: boolean): string {
  const local = todayIn(PUZZLE_TZ, isHome ? 0 : -1);
  return date === todayIn(PUZZLE_TZ, isHome ? -1 : -2) ? local : date;
}

// CDN lifetime for those pages: at most an hour, and never past local midnight when the label changes
export function linkedinPageMaxAge(): number {
  const [h, m, s] = new Intl.DateTimeFormat("en-GB", { timeZone: PUZZLE_TZ, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .format(new Date())
    .split(":")
    .map(Number);
  return Math.max(60, Math.min(3600, 86_400 - ((h % 24) * 3600 + m * 60 + s)));
}

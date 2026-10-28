import { todayIn } from "../crawl.ts";

// LinkedIn rolls its games over at midnight Pacific time, so that is the date a puzzle belongs to
export const LINKEDIN_TZ = process.env.LINKEDIN_TIMEZONE || "America/Los_Angeles";

export const linkedinToday = (offsetDays = 0) => todayIn(LINKEDIN_TZ, offsetDays);

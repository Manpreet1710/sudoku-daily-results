import type { CrawlOutcome } from "./crawl.ts";

// Posts a message to Slack through an Incoming Webhook. Does nothing when SLACK_WEBHOOK_URL is not set.
export async function sendSlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) console.warn(`[alert] Slack responded ${res.status}`);
  } catch (e) {
    console.warn("[alert] could not reach Slack:", e instanceof Error ? e.message : e);
  }
}

// Called by every daily-crawl function: sends one Slack message when any crawl ended in "error".
// "not-published" is not an error (the source simply has no puzzle yet), so it stays quiet.
export async function alertCrawl(job: string, outcomes: CrawlOutcome | CrawlOutcome[]): Promise<void> {
  const failed = [outcomes].flat().filter((o) => o.status === "error");
  if (!failed.length) return;
  const lines = failed.map((o) => `• ${o.date}: ${o.detail ?? "unknown error"}`);
  await sendSlack(`:rotating_light: *${job}* failed\n${lines.join("\n")}`);
}

// Wraps a scheduled function so an unexpected crash is reported to Slack too, then re-thrown so Netlify still logs it.
export function alerting<T extends unknown[]>(job: string, fn: (...args: T) => Promise<void>) {
  return async (...args: T) => {
    try {
      await fn(...args);
    } catch (e) {
      await sendSlack(`:rotating_light: *${job}* crashed\n${e instanceof Error ? e.message : String(e)}`);
      throw e;
    }
  };
}

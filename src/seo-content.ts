// Written guide shown under every game page (what it is, how to use it, tips, FAQ).
// The text lives in seo-content.json, keyed by the game's home path; an entry can be
// { "alias": "/other-path" } to reuse another game's text. Edit the JSON and redeploy.
import data from "./seo-content.json";

export interface SeoContent {
  name: string;
  what: string;
  how: string[];
  tips: string[];
  faq: [question: string, answer: string][];
}

type Entry = SeoContent | { alias: string };

const entries = data as unknown as Record<string, Entry>;

export const SEO: Record<string, SeoContent> = Object.fromEntries(
  Object.entries(entries).map(([href, e]) => [href, "alias" in e ? (entries[e.alias] as SeoContent) : e]),
);

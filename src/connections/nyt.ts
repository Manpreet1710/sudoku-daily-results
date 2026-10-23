// Fetches the Connections puzzle for a date from the New York Times' JSON endpoint
// (the same one the Connections page calls). It is not an official public API.

export interface ConnectionsGroup {
  title: string;
  words: string[];
}

export interface ConnectionsSource {
  id: number;
  editor: string;
  groups: ConnectionsGroup[]; // ordered yellow, green, blue, purple (easiest to hardest)
  start: string[]; // the 16 words in their starting board order
}

const BASE = "https://www.nytimes.com/svc/connections/v2";
const UA = "Mozilla/5.0 (compatible; ConnectionsResultsBot/1.0)";

export async function fetchConnections(isoDate: string): Promise<ConnectionsSource | null> {
  const url = `${BASE}/${isoDate}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`nytimes.com responded ${res.status} for ${url}`);

  const j = await res.json();
  const bad = () => new Error(`Unexpected payload from ${url}: ${JSON.stringify(j).slice(0, 200)}`);
  if (j?.status !== "OK" || j.print_date !== isoDate || !Array.isArray(j.categories) || j.categories.length !== 4) throw bad();

  const start: string[] = new Array(16);
  const groups: ConnectionsGroup[] = j.categories.map((c: any) => {
    if (typeof c?.title !== "string" || !Array.isArray(c.cards) || c.cards.length !== 4) throw bad();
    return {
      title: c.title,
      words: c.cards.map((card: any) => {
        if (typeof card?.content !== "string" || !Number.isInteger(card.position) || card.position < 0 || card.position > 15 || start[card.position] !== undefined) throw bad();
        start[card.position] = card.content;
        return card.content;
      }),
    };
  });
  return { id: Number(j.id), editor: String(j.editor ?? ""), groups, start };
}

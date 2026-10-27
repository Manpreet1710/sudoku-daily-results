// Finds the daily Zip puzzle on zipgameunlimited.com. The site ships fixed pools of
// pre-built boards as static JSON and picks one per day with a seeded shuffle, so
// the pick below is a port of that selection (not an official public API).
// Each board is a grid with numbered checkpoints and walls; the site's file also
// carries its own answer path, which we only use to cross-check our solver.

export interface ZipSource {
  id: string; // e.g. "7x7-hard-d2-012"
  size: number; // grid is size x size
  difficulty: "medium" | "hard";
  numbers: [row: number, col: number, n: number][]; // checkpoints, 0-based
  walls: string[]; // "V_r_c": wall right of (r,c); "H_r_c": wall below (r,c)
  sitePath: [number, number][]; // the site's own solution, for cross-checking only
}

const BASE = "https://www.zipgameunlimited.com/puzzles/v2";
const UA = "Mozilla/5.0 (compatible; ZipResultsBot/1.0)";

// First day the site used these pools; earlier days came from older pools we don't mirror
export const ZIP_FIRST_DATE = "2026-10-17";

const utc = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

// Friday to Sunday are the hard 7x7 days, the rest are medium 6x6
const bandOf = (ms: number): "medium" | "hard" => ([5, 6, 0].includes(new Date(ms).getUTCDay()) ? "hard" : "medium");

// How many days of this band came before `ms`, counting from ZIP_FIRST_DATE
function bandDay(ms: number, band: "medium" | "hard") {
  const base = utc(ZIP_FIRST_DATE);
  const days = Math.floor((ms - base) / 864e5);
  if (days <= 0) return 0;
  let n = Math.floor(days / 7) * (band === "hard" ? 3 : 4);
  for (let d = 7 * Math.floor(days / 7); d < days; d++) if (bandOf(base + 864e5 * d) === band) n++;
  return n;
}

// Seeded shuffle of 0..count-1 (FNV-1a seed, mulberry32 generator), exactly as the site does it
function shuffled(band: string, count: number) {
  let r = 0x811c9dc5;
  for (const ch of `zip-daily-v2-${band}`) {
    r ^= ch.charCodeAt(0);
    r = Math.imul(r, 0x1000193);
  }
  r >>>= 0;
  const rand = () => {
    r = (r + 0x6d2b79f5) >>> 0;
    let e = Math.imul(r ^ (r >>> 15), 1 | r);
    e ^= e + Math.imul(e ^ (e >>> 7), 61 | e);
    return ((e ^ (e >>> 14)) >>> 0) / 0x100000000;
  };
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const parseCell = (s: string): [number, number] => {
  const m = /^(\d+)-(\d+)$/.exec(s);
  if (!m) throw new Error(`Bad cell "${s}"`);
  return [Number(m[1]), Number(m[2])];
};

const pools = new Map<string, any>();
async function pool(size: string) {
  if (!pools.has(size)) {
    const url = `${BASE}/daily-${size}.json`;
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (!res.ok) throw new Error(`zipgameunlimited.com responded ${res.status} for ${url}`);
    pools.set(size, await res.json());
  }
  return pools.get(size);
}

export async function fetchZip(isoDate: string): Promise<ZipSource | null> {
  if (isoDate < ZIP_FIRST_DATE) return null;
  const ms = utc(isoDate);
  const band = bandOf(ms);
  const sizeName = band === "hard" ? "7x7" : "6x6";

  const data = await pool(sizeName);
  const list: any[] = data?.puzzles?.[band] ?? [];
  if (list.length === 0) throw new Error(`Empty ${sizeName} ${band} pool`);
  const p = list[shuffled(band, list.length)[bandDay(ms, band) % list.length]];

  const size = Number(sizeName[0]);
  const bad = () => new Error(`Unexpected puzzle shape in ${sizeName} pool: ${JSON.stringify(p).slice(0, 200)}`);
  if (typeof p?.id !== "string" || !p.numberPositions || !Array.isArray(p.wallPositions) || !Array.isArray(p.path)) throw bad();
  const numbers = Object.entries(p.numberPositions).map(([k, n]) => [...parseCell(k), Number(n)] as [number, number, number]);
  if (numbers.length < 2 || numbers.some(([r, c, n]) => r >= size || c >= size || !Number.isInteger(n))) throw bad();
  if (!p.wallPositions.every((w: unknown) => typeof w === "string" && /^[VH]_\d+_\d+$/.test(w))) throw bad();
  return { id: p.id, size, difficulty: band, numbers, walls: p.wallPositions, sitePath: p.path.map(parseCell) };
}

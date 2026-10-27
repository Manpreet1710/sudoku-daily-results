// Publishes one day's LinkedIn Mini Sudoku: the 36 clues row by row, 0 or . for empty cells.
// Usage: CRAWL_SECRET=... npm run add:mini-sudoku -- <puzzle> [YYYY-MM-DD] [site url]
export {};
const [puzzle, date, site = process.env.SITE_URL ?? "https://sudoku-results.netlify.app"] = process.argv.slice(2);
if (!puzzle || !process.env.CRAWL_SECRET) {
  console.error("usage: CRAWL_SECRET=... npm run add:mini-sudoku -- <36 cells, e.g. 001003002005103502204601300100400300> [date] [site url]");
  process.exit(1);
}
const q = new URLSearchParams({ puzzle, ...(date ? { date } : {}), force: "1" });
const res = await fetch(`${site}/api/mini-sudoku/add?${q}`, { method: "POST", headers: { Authorization: `Bearer ${process.env.CRAWL_SECRET}` } });
console.log(res.status, await res.text());
process.exit(res.ok ? 0 : 1);

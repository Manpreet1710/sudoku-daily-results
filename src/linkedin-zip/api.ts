// LinkedIn's own Zip puzzle for today, converted to the checkpoints and walls our solver reads.
// The payload also carries LinkedIn's answer path, which we only use to cross-check our solver.

import { fetchLinkedInGame, LINKEDIN_GAME } from "../linkedin/client.ts";
import type { ZipSource } from "../zip/api.ts";

export interface LinkedInZipSource extends Pick<ZipSource, "size" | "numbers" | "walls" | "sitePath"> {
  puzzleId: number;
}

export async function fetchLinkedInZip(): Promise<LinkedInZipSource> {
  const { puzzleId, puzzle: p } = await fetchLinkedInGame(LINKEDIN_GAME.zip, "trailGamePuzzle", "zip");
  const bad = (why: string) => new Error(`Unexpected payload from linkedin.com: ${why}`);
  const n = p?.gridSize;
  if (!Number.isInteger(n) || n < 4 || n > 12 || p.solution?.length !== n * n || !Array.isArray(p.orderedSequence) || !Array.isArray(p.walls)) throw bad("zip grid");

  const at = (i: number): [number, number] => [Math.floor(i / n), i % n];
  const sitePath = p.solution.map(at);
  const numbers = p.orderedSequence.map((i: number, k: number): [number, number, number] => [...at(i), k + 1]);

  // A wall sits on one side of a cell: "V_r_c" is right of (r,c), "H_r_c" is below it
  const walls = p.walls.map((w: any) => {
    const [r, c] = at(w.cellIdx);
    switch (String(w.direction).toUpperCase()) {
      case "RIGHT": case "EAST": return `V_${r}_${c}`;
      case "DOWN": case "BOTTOM": case "SOUTH": return `H_${r}_${c}`;
      case "LEFT": case "WEST": return `V_${r}_${c - 1}`;
      case "UP": case "TOP": case "NORTH": return `H_${r - 1}_${c}`;
      default: throw bad(`wall direction ${w.direction}`);
    }
  });
  // LinkedIn's own path must never cross a wall, which proves the directions were read correctly
  const key = (a: [number, number], b: [number, number]) =>
    a[0] === b[0] ? `V_${a[0]}_${Math.min(a[1], b[1])}` : `H_${Math.min(a[0], b[0])}_${a[1]}`;
  for (let i = 1; i < sitePath.length; i++) if (walls.includes(key(sitePath[i - 1], sitePath[i]))) throw bad("a wall blocks LinkedIn's own path, so its direction was misread");

  return { puzzleId, size: n, numbers, walls, sitePath };
}

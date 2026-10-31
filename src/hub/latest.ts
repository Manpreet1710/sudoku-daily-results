import { listWordleDates } from "../wordle/store.ts";
import { listConnectionsDates } from "../connections/store.ts";
import { listSpellingBeeDates } from "../spelling-bee/store.ts";
import { listStrandsDates } from "../strands/store.ts";
import { listPipsDates } from "../pips/store.ts";
import { listNytSudokuDates } from "../nyt-sudoku/store.ts";
import { listLinkedInQueensDates } from "../linkedin-queens/store.ts";
import { listLinkedInTangoDates } from "../linkedin-tango/store.ts";
import { listLinkedInZipDates } from "../linkedin-zip/store.ts";
import { listMiniSudokuDates } from "../mini-sudoku/store.ts";
import { listDates } from "../store.ts";
import { listMiniDates } from "../mini-crossword/store.ts";
import { listQueensDates } from "../queens/store.ts";
import { listTangoDates } from "../tango/store.ts";
import { listZipDates } from "../zip/store.ts";
import type { HubKind } from "./render.ts";

// How to list each game's saved days, keyed by the game's href (see the hub game lists)
const LISTERS: Record<HubKind, Record<string, () => Promise<string[]>>> = {
  nyt: {
    "/today-wordle-answer": listWordleDates,
    "/connections-hint-today": listConnectionsDates,
    "/spelling-bee": listSpellingBeeDates,
    "/strands": listStrandsDates,
    "/pips": listPipsDates,
    "/nyt-sudoku": listNytSudokuDates,
  },
  linkedin: {
    "/linkedin-queens": listLinkedInQueensDates,
    "/linkedin-tango": listLinkedInTangoDates,
    "/linkedin-zip": listLinkedInZipDates,
    "/linkedin-mini-sudoku": listMiniSudokuDates,
  },
  more: {
    "/daily-sudoku": listDates,
    "/mini-crossword": listMiniDates,
    "/queens-unlimited": listQueensDates,
    "/tango-unlimited": listTangoDates,
    "/zip-unlimited": listZipDates,
  },
};

// Most recent saved day (YYYY-MM-DD) of every game in the given hubs; a game whose store can't be read is left out.
export async function latestDates(...kinds: HubKind[]): Promise<Record<string, string | undefined>> {
  const latest: Record<string, string | undefined> = {};
  await Promise.all(
    kinds.flatMap((kind) =>
      Object.entries(LISTERS[kind]).map(async ([href, list]) => {
        try {
          latest[href] = (await list())[0]; // newest first
        } catch (e) {
          console.warn(`[latest] could not list ${href}:`, e instanceof Error ? e.message : e);
        }
      })
    )
  );
  return latest;
}

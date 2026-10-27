// Spoiler-ordered hints derived from the answer list, mildest first.

export interface SpellingBeeFacts {
  count: number;
  pangrams: number;
  byLength: [length: number, count: number][];
  byLetter: [letter: string, count: number][];
}

const tally = <K extends string | number>(keys: K[]) => {
  const m = new Map<K, number>();
  for (const k of keys) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m].sort((a, b) => (a[0] < b[0] ? -1 : 1));
};

export function spellingBeeFacts(answers: string[], pangrams: string[]): SpellingBeeFacts {
  return {
    count: answers.length,
    pangrams: pangrams.length,
    byLength: tally(answers.map((w) => w.length)),
    byLetter: tally(answers.map((w) => w[0].toUpperCase())),
  };
}

export function spellingBeeHints(answers: string[], pangrams: string[]): string[] {
  const f = spellingBeeFacts(answers, pangrams);
  const p = pangrams[0];
  return [
    `There are ${f.count} words today, including ${f.pangrams} pangram${f.pangrams === 1 ? "" : "s"}.`,
    `The pangram${f.pangrams === 1 ? " has" : "s have"} ${pangrams.map((w) => w.length).join(" and ")} letters.`,
    `Words by length: ${f.byLength.map(([n, c]) => `${n} letters ×${c}`).join(", ")}.`,
    `Words by first letter: ${f.byLetter.map(([l, c]) => `${l} ×${c}`).join(", ")}.`,
    `The first pangram starts with "${p[0].toUpperCase()}" and ends with "${p.at(-1)!.toUpperCase()}".`,
  ];
}

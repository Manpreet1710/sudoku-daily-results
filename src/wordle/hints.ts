// Spoiler-ordered hints derived from the answer itself, mildest first.

const VOWELS = new Set("aeiou");

export interface WordleFacts {
  vowels: number;
  unique: number;
  repeated: boolean;
}

export function wordleFacts(word: string): WordleFacts {
  const letters = [...word];
  const unique = new Set(letters).size;
  return { vowels: letters.filter((c) => VOWELS.has(c)).length, unique, repeated: unique < letters.length };
}

export function wordleHints(word: string): string[] {
  const { vowels, repeated } = wordleFacts(word);
  const up = word.toUpperCase();
  return [
    `The word has ${vowels} vowel${vowels === 1 ? "" : "s"} (A, E, I, O, U – Y not counted).`,
    repeated ? "At least one letter appears more than once." : "All five letters are different.",
    `It starts with "${up[0]}".`,
    `It ends with "${up[4]}".`,
    `Its letters in alphabetical order: ${[...up].sort().join(" ")}.`,
  ];
}

// Written content shown under every game page: what the game is, how to play it with this site,
// solving tips and an FAQ. Keyed by the game's home path (see GAMES in render.ts).
export interface SeoContent {
  name: string;
  what: string;
  how: string[];
  tips: string[];
  faq: [question: string, answer: string][];
}

const queens: SeoContent = {
  name: "Queens",
  what: "Queens is a logic puzzle played on a square grid that is split into coloured regions. Your job is to place one queen in every row, every column and every colour region, with no two queens touching, not even diagonally. Every board has a logical route to the answer, so no guessing is needed.",
  how: [
    "Study the coloured regions first. The smallest regions leave you the fewest choices, so they are the best place to start.",
    "Open one hint at a time. Each hint is a single deduction, so you get a nudge without seeing the whole board.",
    "Press Show full solution to switch the board to the finished arrangement and see the queen coordinates.",
    "Open the step-by-step proof to read why each queen has to go where it does.",
  ],
  tips: [
    "Start with regions that are only one or two cells wide: their queens are almost decided.",
    "If a region sits inside a single row or column, no other region can place a queen in that line.",
    "Every queen rules out the eight squares around it, so cross those cells off as you go.",
    "When two regions share the same two columns, those columns are used up and the rest of the board can drop them.",
  ],
  faq: [
    ["Can two queens touch diagonally?", "No. Queens may not be next to each other in any direction, including diagonally."],
    ["Is there more than one solution?", "Daily boards are built to have a single solution. If a board has several, the page says so and shows one valid arrangement."],
    ["Do I need to guess?", "No. Every board can be solved by pure deduction, and the step-by-step proof shows the logic."],
    ["Does a new puzzle appear every day?", "Yes. Use the arrows or the date button at the top to move between days or open the archive."],
  ],
};

const tango: SeoContent = {
  name: "Tango",
  what: "Tango is a 6×6 logic puzzle played with suns and moons. Fill the grid so that every row and column holds exactly three of each symbol, never more than two of the same symbol side by side, and every = and × sign between cells is respected.",
  how: [
    "Read the signs on the board: = means the two cells hold the same symbol, × means they hold opposite symbols.",
    "Open a hint for one deduction at a time, without spoiling the rest of the grid.",
    "Press Show full solution to fill every cell with its sun or moon.",
    "Open the step-by-step timeline to follow the logic that leads from the given symbols to the finished grid.",
  ],
  tips: [
    "If two cells in a row already match, the cells on either side of them must be the opposite symbol.",
    "Count symbols per row and column: once a line has three suns, every empty cell in it is a moon.",
    "A × sign next to a known symbol gives you the other cell straight away.",
    "Avoid patterns of three: a gap between two matching symbols has to be the opposite one.",
  ],
  faq: [
    ["What do the = and × signs mean?", "= joins two cells that must show the same symbol. × joins two cells that must show different symbols."],
    ["How many suns and moons go in each row?", "Exactly three of each, in every row and every column."],
    ["Can three suns sit next to each other?", "No. No more than two identical symbols may be adjacent, horizontally or vertically."],
    ["Is guessing ever required?", "No. Each grid can be solved by logic alone, and the timeline shows each deduction."],
  ],
};

const zip: SeoContent = {
  name: "Zip",
  what: "Zip is a path puzzle. Draw one continuous line that starts at the number 1, visits every numbered checkpoint in order, and fills every cell of the grid exactly once. Thick walls block the line, so you can never cross them.",
  how: [
    "Find the checkpoints and the walls. The line has to run from 1 up to the highest number.",
    "Open a hint for a clue about the start of the route without revealing the full path.",
    "Press Show full solution to draw the complete route on the board.",
    "Read the turn-by-turn route list to see the moves between each pair of checkpoints.",
  ],
  tips: [
    "Cells with only one open neighbour are dead ends, so they must be the start or the end of the line.",
    "Corners and cells next to walls have few exits. Plan the line through them first.",
    "Work backwards from the last number as well as forwards from 1.",
    "Check that no empty cell gets cut off from the rest of the grid, because the line must reach it.",
  ],
  faq: [
    ["Must the line cover every cell?", "Yes. The line passes through every cell exactly once."],
    ["Do I have to visit the numbers in order?", "Yes, from 1 upwards. You can pass over other cells in between."],
    ["Can the line cross a wall?", "No. Thick wall segments block movement between two cells."],
    ["Is the shown route the only one?", "Usually yes. If several valid routes exist, the page notes it and shows one of them."],
  ],
};

const miniSudoku: SeoContent = {
  name: "Mini Sudoku",
  what: "Mini Sudoku is a compact 6×6 version of Sudoku. Fill the grid so that every row, every column and every outlined region contains the digits 1 to 6 exactly once. It is quick to play and uses the same logic as the classic puzzle.",
  how: [
    "Look at the given digits and the outlined regions. Regions are usually 2×3 boxes but can have other shapes.",
    "Open a hint to see where the next move is, one cell at a time.",
    "Press Show full solution to fill in the whole grid, with the answers in colour.",
    "Open the step-by-step timeline to see which technique unlocks each cell.",
  ],
  tips: [
    "Scan each row, column and region for the digit that has only one possible cell left.",
    "A cell that sees five different digits can only hold the sixth.",
    "Look at rows and columns that already hold four or five digits first.",
    "Write down candidates for tricky cells and cross them off as the grid fills in.",
  ],
  faq: [
    ["Which digits does Mini Sudoku use?", "Only 1 to 6, each exactly once per row, column and region."],
    ["Are the regions always 2×3?", "Often, but not always. The page draws the thick region borders for each day."],
    ["Is a new puzzle published every day?", "Yes. Browse previous days with the date arrows or the archive."],
    ["Do I need to guess?", "Not for the logical steps shown. If a puzzle ever needs a trial, the page says so."],
  ],
};

const nytSudoku: SeoContent = {
  name: "NYT Sudoku",
  what: "The New York Times publishes three Sudoku puzzles every day: easy, medium and hard. Each is a standard 9×9 grid where every row, column and 3×3 box must contain the digits 1 to 9 exactly once. This page solves each one with a logic engine and checks the result against the NYT's own answer.",
  how: [
    "Choose Easy, Medium or Hard with the tabs at the top of the board.",
    "Press Place one to reveal the next logical digit, or play the solution at your own speed.",
    "Press Show full solution to fill the whole grid, or Reset to go back to the original puzzle.",
    "Open the step-by-step timeline and click any step to preview the board at that deduction.",
  ],
  tips: [
    "Begin with the rows, columns and boxes that already hold the most digits.",
    "Hidden singles: if a digit fits only one cell in a row, column or box, place it there.",
    "Naked pairs and pointing pairs help on medium and hard grids by removing candidates elsewhere.",
    "Take notes of candidates in each cell and update them every time you place a digit.",
  ],
  faq: [
    ["How is the solution produced?", "Our own solver applies logical techniques in order and records each one. The final grid is compared with the NYT's answer."],
    ["What is the difference between the three levels?", "The harder levels give fewer clues and need more advanced techniques."],
    ["Do I get to see only a hint?", "Yes. Use Place one to reveal a single digit and keep solving on your own."],
    ["Can I see earlier days?", "Yes. Use the date arrows or the archive."],
  ],
};

const dailySudoku: SeoContent = {
  name: "Daily Sudoku",
  what: "The Sudoku Daily Challenge is a 9×9 Sudoku with a new puzzle every day. Fill the grid so that every row, column and 3×3 box holds the digits 1 to 9 exactly once. Here you get a verified solution and a replayable timeline that explains each deduction.",
  how: [
    "Look at the board: the dark digits are the given clues.",
    "Press Place one to reveal the next logical digit and see the technique used.",
    "Use Play to watch the whole solve, or Show full solution to jump to the end. Reset starts over.",
    "Open the step-by-step timeline and click a step to preview the board at that point.",
  ],
  tips: [
    "Start with the digits that appear most often in the givens and find where their last copy fits.",
    "Look for hidden singles in every box before turning to harder techniques.",
    "If you are stuck, check rows and columns with only two or three empty cells.",
    "Keep candidate notes small and update them after every placement.",
  ],
  faq: [
    ["Is the solution checked?", "Yes. The solver confirms that the grid is valid and that the solution is unique."],
    ["Which techniques are used?", "The timeline names each technique, for example Hidden Single or Naked Pair."],
    ["Does the puzzle change daily?", "Yes. Previous days stay available in the archive."],
    ["Can I only see a hint?", "Yes. Place one reveals a single move without the full solution."],
  ],
};

export const SEO: Record<string, SeoContent> = {
  "/today-wordle-answer": {
    name: "Wordle",
    what: "Wordle is the New York Times word game where you guess a hidden five-letter word in six tries. After each guess, green tiles mark letters in the right place, yellow tiles mark letters in the word but in the wrong place, and grey tiles mark letters that are not in the word. A new word appears every day.",
    how: [
      "Open the hints one at a time. They start with the vowels and the letter pattern and get more specific.",
      "Stop at any hint once you can work out the word yourself.",
      "Press Show full solution when you want the answer; the tiles flip to the word.",
      "Use the date arrows or the archive to check earlier Wordle answers.",
    ],
    tips: [
      "Open with a word that uses common letters and several different vowels, such as a word with E, A and R.",
      "Use the second guess to test new letters instead of repeating grey ones.",
      "Remember that double letters are possible, so a yellow letter may appear twice.",
      "Track which positions a letter cannot be in, and use that to rule out candidates.",
    ],
    faq: [
      ["How many guesses do I get?", "Six guesses to find the five-letter word."],
      ["When does the new Wordle word appear?", "A new word is published every day. This site adds the hints for each day's word."],
      ["Do the hints spoil the answer?", "No. The first hints talk about the pattern of letters. Only the last button shows the word."],
      ["Where are old answers?", "Every past day is in the archive with its own hints and solution."],
    ],
  },
  "/connections-hint-today": {
    name: "Connections",
    what: "Connections is a New York Times word-grouping game. You get 16 words and must sort them into four groups of four that share something in common. The groups are coloured yellow, green, blue and purple, from the most straightforward to the trickiest, and you can make only four mistakes.",
    how: [
      "Read the 16 words in their starting layout.",
      "Open the category hints. Each one gives the title of a group without telling you which words belong to it.",
      "Press Show full solution to colour the board by group and see all 16 words sorted.",
      "Open the group list to see each category with its four words.",
    ],
    tips: [
      "Look for words with more than one meaning: they are often red herrings that fit two groups.",
      "Start with the group you are surest of, usually yellow, to remove words from the pool.",
      "Check for patterns such as hidden words, prefixes, rhymes or a missing letter.",
      "If you see five words that fit a theme, one of them belongs to another group.",
    ],
    faq: [
      ["How many mistakes are allowed?", "Four. After the fourth wrong group the game ends."],
      ["What do the colours mean?", "Yellow is the easiest group, then green and blue, and purple is the hardest."],
      ["Will the hints reveal which words go together?", "No. They only show the category titles, so you still have to match the words."],
      ["Can I see earlier puzzles?", "Yes, every past day is in the archive."],
    ],
  },
  "/spelling-bee": {
    name: "Spelling Bee",
    what: "Spelling Bee is the New York Times word puzzle built on a hive of seven letters. Make as many words as you can, each at least four letters long and each containing the centre letter. Letters can repeat, and at least one word in the puzzle, the pangram, uses all seven letters.",
    how: [
      "Look at the honeycomb. The centre letter must appear in every word.",
      "Open the hints one by one. They describe the word count, the pangram and the starting letters.",
      "Press Show full solution to see the pangrams and the complete word list.",
      "Use the date arrows or the archive to see earlier hives.",
    ],
    tips: [
      "Look for common endings such as -ING, -ED and -ER and build words around them.",
      "Hunt for the pangram early: it is worth the most points.",
      "Shuffle the outer letters in your head to spot new prefixes and suffixes.",
      "Add an S, a plural or a different ending to every word you find.",
    ],
    faq: [
      ["What is a pangram?", "A word that uses all seven letters of the hive at least once."],
      ["How long must the words be?", "At least four letters, and they must include the centre letter."],
      ["Can letters be reused?", "Yes. A letter can appear as many times as you need in a word."],
      ["Are proper nouns allowed?", "No. Only regular words from the game's dictionary count."],
    ],
  },
  "/strands": {
    name: "Strands",
    what: "Strands is a New York Times word-search puzzle with a theme. A 6×8 grid of letters hides several theme words and one spangram that crosses the board from one side to the opposite side. Join touching letters, including diagonals, to spell the words, and every letter is used exactly once.",
    how: [
      "Read the theme clue at the top of the hints.",
      "Open the hints one at a time: they cover the number of words, their first letters and the spangram.",
      "Press Show full solution to trace every word on the board in its own colour.",
      "Open the lists to see the spangram and the theme words by name.",
    ],
    tips: [
      "Find the spangram first. It splits the board and makes the rest easier.",
      "Words can twist around, so follow touching letters in any direction.",
      "Because every letter is used once, lonely corner letters often belong to a specific word.",
      "Words that are not part of the theme count toward a free hint in the real game.",
    ],
    faq: [
      ["What is the spangram?", "A theme word that runs from one edge of the board to the opposite edge and describes the theme."],
      ["Are diagonal moves allowed?", "Yes. Letters can connect up, down, sideways or diagonally."],
      ["Is every letter used?", "Yes. The theme words and the spangram together cover all 48 letters."],
      ["Can there be more than one layout?", "Sometimes. When that happens the page says so and shows one valid layout."],
    ],
  },
  "/pips": {
    name: "Pips",
    what: "Pips is a New York Times domino puzzle. Place every domino on the board so that each coloured region follows its rule: a sum, greater-than, less-than, equal or not-equal condition shown in the diamond at the corner of the region. Pips comes in easy, medium and hard boards.",
    how: [
      "Choose Easy, Medium or Hard with the tabs above the board.",
      "Click a domino to place it, or click a cell to place the correct domino on it. Click again to take it back.",
      "Use Place one for a single placement, Show full solution for the whole board, and Reset to start again.",
      "Read the rules above the board for what each diamond means.",
    ],
    tips: [
      "Start with a single-cell region that has a sum: only one pip count fits there.",
      "Equals regions need the same pips everywhere, so a domino with two different halves cannot sit across them.",
      "Count how many dominoes can reach a high sum; there are few ways to make a 10 or more.",
      "Cross dominoes off as you place them, since each can be used only once.",
    ],
    faq: [
      ["What do the diamonds mean?", "A number is a sum, > is greater than, < is less than, = means all equal, and ≠ means all different."],
      ["Do I have to use every domino?", "Yes. Every domino goes on the board exactly once."],
      ["Can I turn the dominoes?", "Yes. A domino can be placed either way round."],
      ["Where does the solution come from?", "It is the solution published with each day's puzzle, so it always matches the board."],
    ],
  },
  "/nyt-sudoku": nytSudoku,
  "/linkedin-queens": queens,
  "/linkedin-tango": tango,
  "/linkedin-zip": zip,
  "/linkedin-mini-sudoku": miniSudoku,
  "/queens-unlimited": queens,
  "/tango-unlimited": tango,
  "/zip-unlimited": zip,
  "/daily-sudoku": dailySudoku,
  "/mini-crossword": {
    name: "Mini Crossword",
    what: "The Mini Crossword is a small daily crossword with short across and down clues. It can be solved in a couple of minutes, and the answers cross each other, so each solved word helps with the next.",
    how: [
      "Read the across and down clues next to the grid.",
      "Open a clue to see a hint first and then the answer.",
      "Press Show full solution to fill the whole grid with letters.",
      "Choose a difficulty tab, when there are two puzzles, to move between them.",
    ],
    tips: [
      "Start with the clues you know right away, such as short or fill-in-the-blank clues.",
      "Use crossing letters to confirm or reject your guesses.",
      "Check the number of letters in each clue before you write an answer.",
      "Think about puns and wordplay when a clue has a question mark.",
    ],
    faq: [
      ["How big is the grid?", "The grid size is shown above the board for each puzzle."],
      ["Are there hints for each clue?", "Yes. Each clue has an optional hint before the answer."],
      ["Is a new crossword added every day?", "Yes. Earlier days are in the archive."],
      ["Do the clues change?", "Each day has its own set of clues."],
    ],
  },
  "/word-search": {
    name: "Word Search",
    what: "Word Search is a classic puzzle where you find a list of words hidden in a grid of letters. Words run across, down and diagonally, and on the hardest level they can also run backwards. This version is free, unlimited and runs entirely in your browser.",
    how: [
      "Pick a difficulty and a category to start a new puzzle.",
      "Press the first letter of a word, drag to the last letter and let go.",
      "Use Hint if you are stuck to see where one word starts.",
      "Press New for a fresh puzzle, or go back to choose another category.",
    ],
    tips: [
      "Scan the grid for uncommon letters such as Q, Z or X; they start fewer words.",
      "Go through the list one word at a time instead of searching for them all at once.",
      "Look at diagonals as well as rows, since they are easy to miss.",
      "Cross words off the list as you find them to keep track.",
    ],
    faq: [
      ["Do I need an account?", "No. There is no sign-up, and nothing is stored on our servers."],
      ["Where are my best times saved?", "In your browser only."],
      ["Can words run backwards?", "On the Hard level, yes."],
      ["Which categories are there?", "Fruits, vegetables, computer, music, countries and animals."],
    ],
  },
};

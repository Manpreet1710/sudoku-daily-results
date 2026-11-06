// Header mega menu and footer shared with the main Words With Letters site; keep in sync with it
import { LOGO_SVG } from "./logo.ts";

export const MENU_ICON = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23fff%22 stroke-width=%222%22 stroke-linecap=%22round%22%3E%3Cpath d=%22M4 7h16M4 12h16M4 17h16%22/%3E%3C/svg%3E";
export const CLOSE_ICON = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23fff%22 stroke-width=%222%22 stroke-linecap=%22round%22%3E%3Cpath d=%22M6 6l12 12M18 6 6 18%22/%3E%3C/svg%3E";

export const SITE_MENU_HTML = `<nav class="wg-menu" aria-label="Primary"> <ul class="wg-menu__list"><li class="wg-menu__item"> <button class="wg-menu__btn" type="button" aria-expanded="false" aria-controls="mm-solvers">Word Solvers</button> <div class="wg-mega" id="mm-solvers"> <div class="wg-mega__inner wg-mega__inner--solvers"><div class="wg-mega__col"> <p class="wg-mega__title">Popular solvers</p><div class="wg-mega__cards"><a class="wg-mega__card" href="/wordle-solver"><b>Wordle Solver</b><small>Narrow down the answer with greens, yellows and greys.</small></a><a class="wg-mega__card" href="/letter-unscrambler-into-words"><b>Word Unscrambler</b><small>Turn a jumble of letters into every valid word.</small></a><a class="wg-mega__card" href="/word-generator-from-letters"><b>Anagram Solver</b><small>Rearrange letters to find all possible anagrams.</small></a><a class="wg-mega__card" href="/find-words-with-letters-in-certain-positions"><b>Words in Certain Positions</b><small>Fix letters in exact spots and find what fits.</small></a><a class="wg-mega__card" href="/find-words-that-start-with-the-letters"><b>Words Starting With</b><small>List words that begin with any letters you choose.</small></a><a class="wg-mega__card" href="/words-with-these-letters-and-3-blanks"><b>Words With 3 Blanks</b><small>Solve racks that include up to three wildcards.</small></a></div></div><div class="wg-mega__col"> <p class="wg-mega__title">Word finders</p><a class="wg-mega__link" href="/make-words-with-these-letters">Make Words From Letters</a><a class="wg-mega__link" href="/words-spelled-with-these-letters">Words Spelled With Letters</a><a class="wg-mega__link" href="/words-with-letters">Words With Specific Letters</a><a class="wg-mega__link" href="/how-many-words-can-you-make-from-these-letters">How Many Words Can I Make?</a><a class="wg-mega__link" href="/what-words-can-i-spell-with-these-letters-and-a-blank">Words With Letters + 1 Blank</a><a class="wg-mega__link" href="/words-with-these-letters-and-2-blanks">Words With Letters + 2 Blanks</a><a class="wg-mega__link" href="/mix-letters-into-words">Mix Letters Into Words</a></div><div class="wg-mega__col"> <p class="wg-mega__title">Words by length</p><div class="wg-mega__nums"><a href="/two-letter-words-with-these-letters" aria-label="2 letter words"><b>2</b><small>letters</small></a><a href="/three-letter-words-with-these-letters" aria-label="3 letter words"><b>3</b><small>letters</small></a><a href="/four-letter-words-with-these-letters" aria-label="4 letter words"><b>4</b><small>letters</small></a><a href="/five-letter-words-with-these-letters" aria-label="5 letter words"><b>5</b><small>letters</small></a><a href="/six-letter-words-with-these-letters" aria-label="6 letter words"><b>6</b><small>letters</small></a><a href="/seven-letter-words-with-these-letters" aria-label="7 letter words"><b>7</b><small>letters</small></a><a href="/eight-letter-words-with-these-letters" aria-label="8 letter words"><b>8</b><small>letters</small></a><a href="/nine-letter-words-with-these-letters" aria-label="9 letter words"><b>9</b><small>letters</small></a><a href="/ten-letter-words-with-these-letters" aria-label="10 letter words"><b>10</b><small>letters</small></a><a href="/eleven-letter-words-with-these-letters" aria-label="11 letter words"><b>11</b><small>letters</small></a><a href="/twelve-letter-words-with-these-letters" aria-label="12 letter words"><b>12</b><small>letters</small></a><a href="/thirteen-letter-words-with-these-letters" aria-label="13 letter words"><b>13</b><small>letters</small></a></div><a class="wg-mega__more" href="/x-letter-words-with-letters">Any length &rarr;</a></div></div> </div> </li><li class="wg-menu__item"> <button class="wg-menu__btn" type="button" aria-expanded="false" aria-controls="mm-cheats">Game Solvers</button> <div class="wg-mega" id="mm-cheats"> <div class="wg-mega__inner wg-mega__inner--cheats"><div class="wg-mega__col"> <p class="wg-mega__title">Puzzle solvers</p><a class="wg-mega__link" href="/squareword-solver">Squareword Solver</a><a class="wg-mega__link" href="/phrazle-solver">Phrazle Solver</a><a class="wg-mega__link" href="/octordle">Octordle Solver</a><a class="wg-mega__link" href="/quordle">Quordle Solver</a><a class="wg-mega__link" href="/sedecordle">Sedecordle Solver</a><a class="wg-mega__link" href="/waffle">Waffle Solver</a><a class="wg-mega__link" href="/foodle-solver">Foodle Solver</a></div><div class="wg-mega__col"> <p class="wg-mega__title">Game cheats</p><a class="wg-mega__link" href="/4-pics-1-word-cheat">4 Pics 1 Word Cheat</a><a class="wg-mega__link" href="/crossword-clue-solve">Crossword Clue Solver</a><a class="wg-mega__link" href="/hanging-with-friends-cheat">Hanging With Friends Cheat</a><a class="wg-mega__link" href="/word-chums-cheat">Word Chums Cheat</a><a class="wg-mega__link" href="/word-cookies-cheat-sheet">Word Cookies Cheat Sheet</a><a class="wg-mega__link" href="/word-streak-with-friends">Word Streak With Friends Cheat</a><a class="wg-mega__link" href="/wordfeud-cheat">Wordfeud Cheat</a></div><div class="wg-mega__col"> <p class="wg-mega__title">More tools</p><a class="wg-mega__link" href="/word-of-the-day">Word of the Day</a><a class="wg-mega__link" href="/word-meaning">Word Meaning</a><a class="wg-mega__link" href="/">Words With Letters Home</a><a class="wg-mega__link" href="/allpages">All Pages</a></div></div> </div> </li><li class="wg-menu__item"> <button class="wg-menu__btn" type="button" aria-expanded="false" aria-controls="mm-lists">Word Lists</button> <div class="wg-mega" id="mm-lists"> <div class="wg-mega__inner wg-mega__inner--lists"><div class="wg-mega__col"> <p class="wg-mega__title">Words starting with</p><a class="wg-mega__link" href="/words-collections/words-starting-with-h">Words Starting With H</a><a class="wg-mega__link" href="/words-collections/words-starting-with-t">Words Starting With T</a><a class="wg-mega__link" href="/words-collections/words-starting-with-ti">Words Starting With TI</a><a class="wg-mega__link" href="/words-collections/words-starting-with-sh">Words Starting With SH</a><a class="wg-mega__link" href="/words-collections/words-starting-with-wh">Words Starting With WH</a><p class="wg-mega__title wg-mega__title--sub">Words by length</p><a class="wg-mega__link" href="/words-collections/three-letter-words">3 Letter Words</a><a class="wg-mega__link" href="/words-collections/four-letter-words">4 Letter Words</a><a class="wg-mega__link" href="/words-collections/five-letter-words">5 Letter Words</a><a class="wg-mega__link" href="/words-collections/six-letter-words">6 Letter Words</a><a class="wg-mega__link" href="/words-collections/seven-letter-words">7 Letter Words</a><a class="wg-mega__link" href="/words-collections/eight-letter-words">8 Letter Words</a><a class="wg-mega__link" href="/words-collections/nine-letter-words">9 Letter Words</a></div><div class="wg-mega__col"> <p class="wg-mega__title">Words ending in</p><a class="wg-mega__link" href="/words-collections/words-ending-with-en">Words Ending in EN</a><a class="wg-mega__link" href="/words-collections/words-ending-with-x">Words Ending in X</a><a class="wg-mega__link" href="/words-collections/words-ending-with-ch">Words Ending in CH</a><a class="wg-mega__link" href="/words-collections/words-ending-with-k">Words Ending in K</a><a class="wg-mega__link" href="/words-collections/words-ending-with-ent">Words Ending in ENT</a><p class="wg-mega__title wg-mega__title--sub">Vowels & consonants</p><a class="wg-mega__link" href="/words-collections/five-letter-words-with-two-vowels">5 Letter, 2 Vowels</a><a class="wg-mega__link" href="/words-collections/five-letter-words-with-three-vowels">5 Letter, 3 Vowels</a><a class="wg-mega__link" href="/words-collections/four-letter-words-with-two-vowels">4 Letter, 2 Vowels</a><a class="wg-mega__link" href="/words-collections/five-letter-words-with-four-consonants">5 Letter, 4 Consonants</a><a class="wg-mega__link" href="/words-collections/four-letter-words-with-two-consonants">4 Letter, 2 Consonants</a><p class="wg-mega__title wg-mega__title--sub">Letter in middle</p><a class="wg-mega__link" href="/words-collections/words-with-a-in-middle">A in Middle</a><a class="wg-mega__link" href="/words-collections/words-with-e-in-middle">E in Middle</a><a class="wg-mega__link" href="/words-collections/words-with-i-in-middle">I in Middle</a><a class="wg-mega__link" href="/words-collections/words-with-o-in-middle">O in Middle</a><a class="wg-mega__link" href="/words-collections/words-with-u-in-middle">U in Middle</a></div><div class="wg-mega__col"> <p class="wg-mega__title">Lists of words</p><a class="wg-mega__link" href="/words-collections/all-l-letter-words-pages">Words by Length</a><a class="wg-mega__link" href="/words-collections/all-starting-with-x-pages">Words by Starting Letters</a><a class="wg-mega__link" href="/words-collections/all-ending-with-x-pages">Words by Ending Letters</a><a class="wg-mega__link" href="/words-collections/all-l-letter-containing-x-pages">Words by Length + Containing</a><a class="wg-mega__link" href="/words-collections/all-l-letter-ending-with-x-pages">Words by Length + Ending</a><a class="wg-mega__link" href="/words-collections/all-x-letter-ending-with-y-and-constaining-z">Words by Length + Ending + Containing</a><a class="wg-mega__link" href="/words-collections/all-words-starting-and-containing-with">Words by Starting + Containing</a><a class="wg-mega__link" href="/words-collections/all-l-letter-starting-with-x-pages">Words by Length + Starting</a><a class="wg-mega__link" href="/words-collections/all-x-letter-word-starting-with-y-and-ending-with-z">Words by Length + Starting + Ending</a><a class="wg-mega__link" href="/words-collections/all-ending-containing-words-pages">Words by Ending + Containing</a><a class="wg-mega__link" href="/words-collections/all-containing-x-and-y-pages">Words by Containing Two Letters</a><a class="wg-mega__link" href="/words-collections/all-containing-x-pages">Words by Containing a Letter</a><a class="wg-mega__link" href="/words-collections/all-l-letters-containing-x-and-y-words">Words by Length + Containing Two Letters</a><a class="wg-mega__link" href="/words-collections/all-words-starting-with-x-and-ending-z">Words by Starting + Ending Letters</a><a class="wg-mega__link" href="/words-collections/words-containing-x">Words Containing X</a><a class="wg-mega__link" href="/words-collections">All Words Collections</a><a class="wg-mega__link" href="/words-collections/all-words-y-in-middle">Words by Middle Letter</a><a class="wg-mega__link" href="/words-collections/all-x-letter-words-y-in-middle">Words by Length + Middle Letter</a></div><div class="wg-mega__col"> <p class="wg-mega__title">Words with a blank</p><div class="wg-mega__nums"><a href="/2-letter-words-with-these-letters-and-a-blank" aria-label="2 letter words"><b>2</b><small>+ blank</small></a><a href="/3-letter-words-with-these-letters-and-a-blank" aria-label="3 letter words"><b>3</b><small>+ blank</small></a><a href="/4-letter-words-with-these-letters-and-a-blank" aria-label="4 letter words"><b>4</b><small>+ blank</small></a><a href="/5-letter-words-with-these-letters-and-a-blank" aria-label="5 letter words"><b>5</b><small>+ blank</small></a><a href="/6-letter-words-with-these-letters-and-a-blank" aria-label="6 letter words"><b>6</b><small>+ blank</small></a><a href="/7-letter-words-with-these-letters-and-a-blank" aria-label="7 letter words"><b>7</b><small>+ blank</small></a><a href="/8-letter-words-with-these-letters-and-a-blank" aria-label="8 letter words"><b>8</b><small>+ blank</small></a><a href="/9-letter-words-with-these-letters-and-a-blank" aria-label="9 letter words"><b>9</b><small>+ blank</small></a><a href="/10-letter-words-with-these-letters-and-a-blank" aria-label="10 letter words"><b>10</b><small>+ blank</small></a><a href="/11-letter-words-with-these-letters-and-a-blank" aria-label="11 letter words"><b>11</b><small>+ blank</small></a><a href="/12-letter-words-with-these-letters-and-a-blank" aria-label="12 letter words"><b>12</b><small>+ blank</small></a></div><a class="wg-mega__more" href="/x-letter-words-with-letters">Any length &rarr;</a></div></div> </div> </li><li class="wg-menu__item"> <button class="wg-menu__btn" type="button" aria-expanded="false" aria-controls="mm-daily">Daily Puzzle Answers</button> <div class="wg-mega" id="mm-daily"> <div class="wg-mega__inner wg-mega__inner--daily"><div class="wg-mega__col"> <p class="wg-mega__title">NYT Games Hints & Answers</p><div class="wg-mega__games"><a class="wg-mega__game" href="/nyt-wordle-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="9" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="18.5" y="9" width="11" height="11" rx="2.5" fill="#c9b458"/><rect x="32" y="9" width="11" height="11" rx="2.5" fill="#787c7e"/><rect x="5" y="23" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="18.5" y="23" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="32" y="23" width="11" height="11" rx="2.5" fill="#c9b458"/><rect x="5" y="37" width="38" height="4" rx="2" fill="#d3d6da"/></svg> </span><span><b>Today's Wordle Answer & Hints</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/nyt-connections-hints-answers-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="18" height="18" rx="4" fill="#f9df6d"/><rect x="25" y="5" width="18" height="18" rx="4" fill="#a0c35a"/><rect x="5" y="25" width="18" height="18" rx="4" fill="#b0c4ef"/><rect x="25" y="25" width="18" height="18" rx="4" fill="#ba81c5"/></svg> </span><span><b>Connections Hints & Answers Today</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/nyt-spelling-bee-answers-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><path d="M24 4l9 5.2v10.4L24 24.8l-9-5.2V9.2z" fill="#f7da21"/><path d="M14.5 21l9 5.2v10.4l-9 5.2-9-5.2V26.2z" fill="#e6e6e6"/><path d="M33.5 21l9 5.2v10.4l-9 5.2-9-5.2V26.2z" fill="#e6e6e6"/><text x="24" y="19" text-anchor="middle" font-size="10" font-weight="900" fill="#1e1b2e" font-family="Arial,sans-serif">B</text></svg> </span><span><b>Spelling Bee Answers & Pangram</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/nyt-strands-hints-spangram-answers-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="4" y="4" width="40" height="40" rx="8" fill="#e8f3fb"/><path d="M13 13 L24 24 L35 13 M24 24 L24 36" stroke="#5ab0e6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M13 35 L35 35" stroke="#f5c84c" stroke-width="7" stroke-linecap="round"/><g fill="#1e1b2e"><circle cx="13" cy="13" r="2.4"/><circle cx="24" cy="24" r="2.4"/><circle cx="35" cy="13" r="2.4"/><circle cx="24" cy="35" r="2.4"/><circle cx="13" cy="35" r="2.4"/><circle cx="35" cy="35" r="2.4"/></g></svg> </span><span><b>NYT Strands Hints & Spangram</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/nyt-pips-hints-answers-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="6" y="9" width="36" height="17" rx="4" fill="#fff" stroke="#1e1b2e" stroke-width="2.5"/><path d="M24 9v17" stroke="#1e1b2e" stroke-width="2.5"/><g fill="#e11d48"><circle cx="13" cy="14" r="2.2"/><circle cx="17.5" cy="21" r="2.2"/><circle cx="30" cy="17.5" r="2.2"/><circle cx="36" cy="14" r="2.2"/><circle cx="36" cy="21" r="2.2"/></g><rect x="10" y="30" width="28" height="11" rx="3" fill="#fbbf24"/><rect x="24" y="30" width="14" height="11" rx="3" fill="#a855f7"/></svg> </span><span><b>NYT Pips Hints & Answers</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/nyt-sudoku-hints-answers-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="38" height="38" rx="6" fill="#fff" stroke="#4f46e5" stroke-width="2.5"/><path d="M17.7 5v38M30.3 5v38M5 17.7h38M5 30.3h38" stroke="#c7d2fe" stroke-width="2"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle"><text x="11.3" y="14.6" fill="#4f46e5">5</text><text x="24" y="27.2" fill="#4f46e5">3</text><text x="36.6" y="39.8" fill="#e11d48">9</text><text x="36.6" y="14.6" fill="#1e1b2e">1</text><text x="11.3" y="39.8" fill="#1e1b2e">7</text></g></svg> </span><span><b>NYT Sudoku Hints & Answers</b><small>Updated daily</small></span></a></div> </div><div class="wg-mega__col"> <p class="wg-mega__title">LinkedIn Games Answers</p><div class="wg-mega__games"><a class="wg-mega__game" href="/linkedin-queens-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="19" height="19" fill="#bfa4f5"/><rect x="24" y="5" width="19" height="19" fill="#f8c78d"/><rect x="5" y="24" width="19" height="19" fill="#9fd6a7"/><rect x="24" y="24" width="19" height="19" fill="#9bc4f6"/><rect x="5" y="5" width="38" height="38" rx="6" fill="none" stroke="#1e1b2e" stroke-width="2.5"/><path transform="translate(8 10)" d="M0 9 L1.3 2 L4.3 5 L6.5 0 L8.7 5 L11.7 2 L13 9 Z" fill="#1e1b2e"/><path transform="translate(27 29)" d="M0 9 L1.3 2 L4.3 5 L6.5 0 L8.7 5 L11.7 2 L13 9 Z" fill="#1e1b2e"/></svg> </span><span><b>LinkedIn Queens Answers</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/linkedin-tango-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><circle cx="15" cy="17" r="8" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"><path d="M15 4v2.5M15 27.5V30M2 17h2.5M25.5 17H28M5.8 7.8l1.8 1.8M22.4 24.4l1.8 1.8M5.8 26.2l1.8-1.8M22.4 9.6l1.8-1.8"/></g><path d="M38 28a9 9 0 1 1-9.5-12A7 7 0 0 0 38 28z" fill="#3b82f6" transform="translate(2 8)"/></svg> </span><span><b>LinkedIn Tango Answers</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/linkedin-zip-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><path d="M12 12 H36 V24 H12 V36 H36" fill="none" stroke="#f97316" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="#fff"><circle cx="12" cy="12" r="7" fill="#1e1b2e"/><text x="12" y="15.2">1</text><circle cx="36" cy="24" r="7" fill="#1e1b2e"/><text x="36" y="27.2">2</text><circle cx="36" cy="36" r="7" fill="#1e1b2e"/><text x="36" y="39.2">3</text></g></svg> </span><span><b>LinkedIn Zip Answers</b><small>Updated daily</small></span></a><a class="wg-mega__game" href="/linkedin-mini-sudoku-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="6" y="6" width="36" height="36" rx="6" fill="#fff" stroke="#0d9488" stroke-width="2.5"/><path d="M18 6v36M30 6v36M6 24h36" stroke="#99f6e4" stroke-width="2"/><g font-family="Arial,sans-serif" font-weight="900" font-size="10" text-anchor="middle"><text x="12" y="19" fill="#0d9488">2</text><text x="24" y="37" fill="#0d9488">6</text><text x="36" y="19" fill="#1e1b2e">4</text></g></svg> </span><span><b>LinkedIn Mini Sudoku Answers</b><small>Updated daily</small></span></a></div> </div><a class="wg-mega__promo" href="/nyt-wordle-answer-today" style="--c1:#22c55e;--c2:#15803d"> <span class="wg-mega__promo-art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="9" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="18.5" y="9" width="11" height="11" rx="2.5" fill="#c9b458"/><rect x="32" y="9" width="11" height="11" rx="2.5" fill="#787c7e"/><rect x="5" y="23" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="18.5" y="23" width="11" height="11" rx="2.5" fill="#6aaa64"/><rect x="32" y="23" width="11" height="11" rx="2.5" fill="#c9b458"/><rect x="5" y="37" width="38" height="4" rx="2" fill="#d3d6da"/></svg> </span> <small>Most popular today</small> <b>Today's Wordle Answer & Hints</b> <span>Today's hints and answer for the Wordle grid.</span> <em>Open &rarr;</em> </a></div> </div> </li><li class="wg-menu__item"> <button class="wg-menu__btn" type="button" aria-expanded="false" aria-controls="mm-games">Word Games</button> <div class="wg-mega" id="mm-games"> <div class="wg-mega__inner wg-mega__inner--daily"><div class="wg-mega__col"> <p class="wg-mega__title">Play free games</p><div class="wg-mega__games"><a class="wg-mega__game" href="/word-search-puzzle"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="38" height="38" rx="6" fill="#fff"/><g font-family="Arial,sans-serif" font-weight="800" font-size="8" fill="#6b7280" text-anchor="middle"><text x="12" y="15">K</text><text x="24" y="15">W</text><text x="36" y="15">E</text><text x="12" y="27">P</text><text x="24" y="27">O</text><text x="36" y="27">A</text><text x="12" y="39">R</text><text x="24" y="39">D</text><text x="36" y="39">T</text></g><path d="M9 12 L39 40" stroke="#ec4899" stroke-width="7" stroke-linecap="round" opacity=".35"/><circle cx="31" cy="31" r="7" fill="none" stroke="#1e1b2e" stroke-width="3"/><path d="m36 36 6 6" stroke="#1e1b2e" stroke-width="3.5" stroke-linecap="round"/></svg> </span><span><b>Play Word Search Puzzle</b><small>Unlimited</small></span></a><a class="wg-mega__game" href="/word-game-generator-online"><span class="wg-mega__art wg-mega__art--ico" aria-hidden="true"><svg class="wg-ico" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.4" cy="8.4" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="15.6" cy="15.6" r=".9" fill="currentColor"/><circle cx="15.6" cy="8.4" r=".9" fill="currentColor"/><circle cx="8.4" cy="15.6" r=".9" fill="currentColor"/></svg> </span><span><b>Word Game Generator</b><small>Create your own</small></span></a></div> </div><div class="wg-mega__col"> <p class="wg-mega__title">Daily game answers</p><div class="wg-mega__games"><a class="wg-mega__game" href="/sudoku-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="38" height="38" rx="6" fill="#fff" stroke="#4f46e5" stroke-width="2.5"/><path d="M17.7 5v38M30.3 5v38M5 17.7h38M5 30.3h38" stroke="#c7d2fe" stroke-width="2"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle"><text x="11.3" y="14.6" fill="#4f46e5">5</text><text x="24" y="27.2" fill="#4f46e5">3</text><text x="36.6" y="39.8" fill="#e11d48">9</text><text x="36.6" y="14.6" fill="#1e1b2e">1</text><text x="11.3" y="39.8" fill="#1e1b2e">7</text></g></svg> </span><span><b>Sudoku Game Answers</b><small>Daily</small></span></a><a class="wg-mega__game" href="/mini-crossword-answers-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="38" height="38" rx="5" fill="#fff" stroke="#1e1b2e" stroke-width="2.5"/><g fill="#1e1b2e"><rect x="5" y="5" width="12.7" height="12.7"/><rect x="30.3" y="30.3" width="12.7" height="12.7"/><rect x="30.3" y="5" width="12.7" height="12.7" opacity="0"/></g><path d="M17.7 5v38M30.3 5v38M5 17.7h38M5 30.3h38" stroke="#1e1b2e" stroke-width="1.6"/><rect x="17.7" y="17.7" width="25.3" height="12.6" fill="#fde68a" opacity=".85"/><g font-family="Arial,sans-serif" font-weight="900" font-size="8" fill="#1e1b2e" text-anchor="middle"><text x="24" y="27">U</text><text x="36.6" y="27">P</text></g></svg> </span><span><b>Mini Crossword Answers</b><small>Daily</small></span></a><a class="wg-mega__game" href="/queens-game-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="19" height="19" fill="#bfa4f5"/><rect x="24" y="5" width="19" height="19" fill="#f8c78d"/><rect x="5" y="24" width="19" height="19" fill="#9fd6a7"/><rect x="24" y="24" width="19" height="19" fill="#9bc4f6"/><rect x="5" y="5" width="38" height="38" rx="6" fill="none" stroke="#1e1b2e" stroke-width="2.5"/><path transform="translate(8 10)" d="M0 9 L1.3 2 L4.3 5 L6.5 0 L8.7 5 L11.7 2 L13 9 Z" fill="#1e1b2e"/><path transform="translate(27 29)" d="M0 9 L1.3 2 L4.3 5 L6.5 0 L8.7 5 L11.7 2 L13 9 Z" fill="#1e1b2e"/></svg> </span><span><b>Queens Game Answers</b><small>Daily</small></span></a><a class="wg-mega__game" href="/tango-game-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><circle cx="15" cy="17" r="8" fill="#fbbf24"/><g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"><path d="M15 4v2.5M15 27.5V30M2 17h2.5M25.5 17H28M5.8 7.8l1.8 1.8M22.4 24.4l1.8 1.8M5.8 26.2l1.8-1.8M22.4 9.6l1.8-1.8"/></g><path d="M38 28a9 9 0 1 1-9.5-12A7 7 0 0 0 38 28z" fill="#3b82f6" transform="translate(2 8)"/></svg> </span><span><b>Tango Game Answers</b><small>Daily</small></span></a><a class="wg-mega__game" href="/zip-game-answer-today"><span class="wg-mega__art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><path d="M12 12 H36 V24 H12 V36 H36" fill="none" stroke="#f97316" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle" fill="#fff"><circle cx="12" cy="12" r="7" fill="#1e1b2e"/><text x="12" y="15.2">1</text><circle cx="36" cy="24" r="7" fill="#1e1b2e"/><text x="36" y="27.2">2</text><circle cx="36" cy="36" r="7" fill="#1e1b2e"/><text x="36" y="39.2">3</text></g></svg> </span><span><b>Zip Game Answers</b><small>Daily</small></span></a></div> </div><a class="wg-mega__promo" href="/sudoku-answer-today" style="--c1:#6366f1;--c2:#4338ca"> <span class="wg-mega__promo-art" aria-hidden="true"><svg class="wg-art" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false"><rect x="5" y="5" width="38" height="38" rx="6" fill="#fff" stroke="#4f46e5" stroke-width="2.5"/><path d="M17.7 5v38M30.3 5v38M5 17.7h38M5 30.3h38" stroke="#c7d2fe" stroke-width="2"/><g font-family="Arial,sans-serif" font-weight="900" font-size="9" text-anchor="middle"><text x="11.3" y="14.6" fill="#4f46e5">5</text><text x="24" y="27.2" fill="#4f46e5">3</text><text x="36.6" y="39.8" fill="#e11d48">9</text><text x="36.6" y="14.6" fill="#1e1b2e">1</text><text x="11.3" y="39.8" fill="#1e1b2e">7</text></g></svg> </span> <small>Most popular today</small> <b>Sudoku Game Answers</b> <span>Today's Sudoku answers and the solved grid.</span> <em>Open &rarr;</em> </a></div> </div> </li><li class="wg-menu__item"><a class="wg-menu__link" href="/blog/">Blog</a></li></ul> </nav>`;

export const SITE_HEADER_CSS = /* css */ `
.wg-home {
  --wg-accent: #ffb020;
  --wg-header: #15111f;
  --wg-line: #e5e2ee;
  --wg-muted: #5c5873;
  --wg-on-accent: #2b1700;
  --wg-primary: #6d28d9;
  --wg-primary-soft: #f1e9fd;
  --wg-r: 16px;
  --wg-r-lg: 24px;
  --wg-sh-1: 0 1px 2px rgba(30, 27, 46, .06), 0 1px 3px rgba(30, 27, 46, .08);
  --wg-sh-3: 0 4px 8px rgba(30, 27, 46, .06), 0 28px 56px -20px rgba(76, 29, 149, .45);
  --wg-surface: #ffffff;
  --wg-surface-2: #f1eff7;
  --wg-text: #1e1b2e;
}
@media (max-width: 768px) {
  .navbar-toggler { position: absolute; right: 10px; z-index: 999999; top: 10px; width: 50px; height: 50px; padding: 0; }
  .navbar-toggler img { height: 50px; }
}
.wg-home.wg-lock { overflow: hidden; }
.wg-skip { position: absolute; left: 16px; top: -64px; z-index: 2000; background: var(--wg-accent); color: var(--wg-on-accent); padding: 12px 16px; border-radius: 12px; font-weight: 800; transition: top .2s; }
.wg-skip:focus { top: 8px; }
.wg-home .wg-header { position: sticky; top: 0; z-index: 1000; width: 100%; background: var(--wg-header); border-bottom: 1px solid rgba(255, 255, 255, .08); }
.wg-header__bar { display: flex; align-items: center; gap: 16px; max-width: 1200px; height: 64px; margin: 0 auto; padding: 0 16px; }
.wg-home .wg-logo { display: inline-flex; flex: none; }
.wg-home .wg-logo img { height: 36px; width: auto; display: block; }
.wg-home .wg-burger { display: none; width: 44px; height: 44px; padding: 0; border: 0; background: transparent; border-radius: 12px; align-items: center; justify-content: center; }
.wg-home .wg-header .navbar-toggler img { height: 24px; width: 24px; }
.wg-home #navbarSupportedContent { display: flex; flex: 1; align-items: center; justify-content: space-between; gap: 16px; min-width: 0; }
.wg-menu__list { display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; }
.wg-menu__item { position: relative; }
.wg-home .wg-menu__btn, .wg-home .wg-menu__link { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border: 0; background: transparent; color: #fff; font: inherit; font-size: 15px; font-weight: 700; border-radius: 12px; cursor: pointer; text-decoration: none; transition: background .15s; }
.wg-home .wg-menu__btn::after { content: ""; width: 7px; height: 7px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: translateY(-2px) rotate(45deg); transition: transform .2s; }
.wg-home .wg-menu__item.is-open > .wg-menu__btn::after { transform: translateY(1px) rotate(-135deg); }
.wg-home .wg-menu__btn:hover, .wg-home .wg-menu__link:hover, .wg-home .wg-menu__item.is-open > .wg-menu__btn { background: rgba(255, 255, 255, .12); color: #fff; }
.wg-mega { position: absolute; left: 0; top: calc(100% + 8px); z-index: 20; display: none; gap: 8px 24px; padding: 20px; min-width: 260px; background: var(--wg-surface); border: 1px solid var(--wg-line); border-radius: var(--wg-r); box-shadow: var(--wg-sh-3); }
.wg-mega--wide { grid-template-columns: repeat(3, minmax(190px, 1fr)); width: max-content; max-width: min(840px, 92vw); }
.wg-menu__item.is-open > .wg-mega { display: grid; }
@media (hover: hover) and (min-width: 992px) {
  .wg-menu__item:hover > .wg-mega { display: grid; }
}
.wg-mega__col { display: flex; flex-direction: column; min-width: 0; }
.wg-mega__title { margin: 0 0 8px; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--wg-muted); }
.wg-home .wg-mega a { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; color: var(--wg-text); font-size: 15px; font-weight: 600; text-decoration: none; min-height: 40px; }
.wg-home .wg-mega a:hover { background: var(--wg-primary-soft); color: var(--wg-primary); }
.wg-mega a small { margin-left: auto; font-size: 12px; color: var(--wg-muted); font-weight: 600; }
@media (max-width: 991.98px) {
  .wg-home .wg-burger { display: inline-flex; }
  .wg-home .wg-header .wg-logo img { height: 32px; }
  .wg-home #navbarSupportedContent { display: none; position: fixed; left: 0; right: 0; top: 64px; bottom: 0; z-index: 999; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 16px; padding: 16px; overflow-y: auto; background: var(--wg-header); border-top: 1px solid rgba(255, 255, 255, .1); }
  .wg-menu__list { flex-direction: column; align-items: stretch; gap: 0; }
  .wg-menu__item { border-bottom: 1px solid rgba(255, 255, 255, .1); }
  .wg-home .wg-menu__btn, .wg-home .wg-menu__link { width: 100%; justify-content: space-between; min-height: 52px; padding: 0 8px; color: #fff; font-size: 17px; }
  .wg-home .wg-menu__btn:hover, .wg-home .wg-menu__link:hover, .wg-home .wg-menu__item.is-open > .wg-menu__btn { background: rgba(255, 255, 255, .1); color: #fff; }
  .wg-mega { position: static; box-shadow: none; border: 0; border-radius: 0; padding: 0 0 12px; min-width: 0; width: auto; max-width: none; }
  .wg-menu__item.is-open > .wg-mega { display: block; }
  .wg-mega--wide { width: auto; }
  .wg-mega__col { margin-bottom: 12px; }
}
@media (min-width: 992px) {
  .wg-home #navbarSupportedContent { display: flex !important; }
}
.wg-ico { display: block; flex: none; }
.wg-game__icon .wg-ico { width: 42px; height: 42px; stroke-width: 1.6; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, .25)); }
.wg-hint__icon .wg-ico { width: 24px; height: 24px; }
.wg-mega__ico { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: var(--wg-primary-soft); color: var(--wg-primary); transition: background .15s, color .15s; }
.wg-mega__ico .wg-ico { width: 18px; height: 18px; }
.wg-home .wg-mega a:hover .wg-mega__ico { background: var(--wg-primary); color: #fff; }
.wg-home .wg-skip { color: var(--wg-on-accent); }
@media (max-width: 991.98px) {
  .wg-mega { background: transparent; }
  .wg-home .wg-mega a { color: #e7e2f7; }
  .wg-home .wg-mega a:hover { background: rgba(255, 255, 255, .1); color: #fff; }
  .wg-mega__title { color: #a59fc0; }
  .wg-mega a small { color: #a59fc0; }
  .wg-home .wg-mega__ico { background: rgba(255, 255, 255, .1); color: #e3a0f7; }
}
.wg-home .wg-header .wg-burger { position: static; right: auto; top: auto; z-index: auto; width: 44px; height: 44px; padding: 0; flex: none; }
@media (max-width: 991.98px) {
  .wg-header__bar { gap: 8px; padding: 0 8px; }
  .wg-home .wg-header .wg-logo { min-width: 0; }
  .wg-home .wg-header .wg-logo img { max-width: 100%; }
}
@media (max-width: 767.98px) {
  .wg-game__icon .wg-ico { width: 28px; height: 28px; }
}
.wg-game__icon--art .wg-art { width: 52px; height: 52px; display: block; }
@media (max-width: 767.98px) {
  .wg-game__icon--art .wg-art { width: 36px; height: 36px; }
}
@media (min-width: 992px) {
  .wg-header__bar { position: relative; }
  .wg-home #navbarSupportedContent { align-self: stretch; }
  .wg-menu, .wg-menu__list { height: 100%; }
  .wg-menu__item { position: static; display: flex; align-items: center; height: 100%; }
  .wg-mega { left: 16px; right: 16px; top: 100%; min-width: 0; padding: 0; overflow: hidden; border-radius: 0 0 var(--wg-r-lg) var(--wg-r-lg); border-top: 0; }
  .wg-menu__item.is-open > .wg-mega { display: block; }
  .wg-menu__item:hover > .wg-mega { display: block; }
  .wg-mega__inner { display: grid; gap: 32px; padding: 24px 28px 28px; }
  .wg-mega__inner--solvers { grid-template-columns: 1.5fr 1fr 1fr; }
  .wg-mega__inner--daily { grid-template-columns: 1fr 1fr 280px; }
  .wg-mega__inner--games, .wg-mega__inner--cross { grid-template-columns: 1fr; }
  .wg-mega__games--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .wg-mega__games--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.wg-mega__title { margin-bottom: 12px; }
.wg-home .wg-mega a small { margin-left: 0; }
.wg-mega__cards { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.wg-home .wg-mega .wg-mega__card { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 10px 12px; min-height: 0; border-radius: 12px; }
.wg-mega__card b { font-size: 15px; font-weight: 800; line-height: 1.3; }
.wg-home .wg-mega .wg-mega__card small { font-size: 13px; line-height: 1.4; color: var(--wg-muted); font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wg-home .wg-mega .wg-mega__card:hover small { color: var(--wg-text); }
.wg-home .wg-mega .wg-mega__link { min-height: 36px; padding: 6px 10px; font-size: 15px; font-weight: 600; }
.wg-mega__nums { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.wg-home .wg-mega .wg-mega__nums a { flex-direction: column; justify-content: center; gap: 0; min-height: 52px; padding: 6px 4px; border: 1px solid var(--wg-line); border-radius: 12px; background: var(--wg-surface-2); text-align: center; }
.wg-mega__nums b { font-size: 18px; font-weight: 900; line-height: 1.1; }
.wg-home .wg-mega .wg-mega__nums small { font-size: 11px; color: var(--wg-muted); font-weight: 700; }
.wg-home .wg-mega .wg-mega__nums a:hover { background: var(--wg-primary); border-color: var(--wg-primary); color: #fff; }
.wg-home .wg-mega .wg-mega__nums a:hover small { color: rgba(255, 255, 255, .85); }
.wg-home .wg-mega .wg-mega__more { min-height: 40px; margin-top: 8px; padding: 6px 10px; color: var(--wg-primary); font-weight: 800; }
.wg-mega__games { display: grid; grid-template-columns: 1fr; gap: 4px; }
.wg-home .wg-mega .wg-mega__game { gap: 12px; padding: 8px 10px; min-height: 52px; border-radius: 12px; }
.wg-mega__game > span:last-child { display: flex; flex-direction: column; min-width: 0; }
.wg-mega__game b { font-size: 15px; font-weight: 800; line-height: 1.25; }
.wg-home .wg-mega .wg-mega__game small { font-size: 12px; color: var(--wg-muted); font-weight: 600; }
.wg-mega__art { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; background: #fff; border: 1px solid var(--wg-line); box-shadow: var(--wg-sh-1); transition: transform .15s; }
.wg-mega__art .wg-art { width: 30px; height: 30px; }
.wg-mega__art--ico { color: var(--wg-primary); }
.wg-mega__art--ico .wg-ico { width: 20px; height: 20px; }
.wg-home .wg-mega .wg-mega__game:hover .wg-mega__art { transform: scale(1.08) rotate(-4deg); }
.wg-home .wg-mega .wg-mega__promo { position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; gap: 4px; min-height: 100%; padding: 20px; border-radius: var(--wg-r); background: linear-gradient(145deg, var(--c1), var(--c2)); color: #fff; overflow: hidden; }
.wg-mega__promo::before { content: ""; position: absolute; inset: 0; background: radial-gradient(120% 80% at 90% 0%, rgba(255, 255, 255, .35), transparent 60%), radial-gradient(rgba(255, 255, 255, .16) 1.2px, transparent 1.4px) 0 0 / 16px 16px; }
.wg-mega__promo > * { position: relative; }
.wg-mega__promo-art { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; margin-bottom: auto; border-radius: 18px; background: rgba(255, 255, 255, .95); box-shadow: 0 10px 24px -10px rgba(0, 0, 0, .45); }
.wg-mega__promo-art .wg-art { width: 46px; height: 46px; }
.wg-home .wg-mega .wg-mega__promo small { margin-top: 16px; color: rgba(255, 255, 255, .85); font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.wg-mega__promo b { font-size: 22px; font-weight: 900; line-height: 1.2; }
.wg-mega__promo span:not(.wg-mega__promo-art) { font-size: 14px; color: rgba(255, 255, 255, .92); }
.wg-mega__promo em { margin-top: 8px; padding: 8px 16px; border-radius: 999px; background: #fff; color: #1e1b2e; font-style: normal; font-weight: 900; font-size: 14px; transition: transform .15s; }
.wg-home .wg-mega .wg-mega__promo:hover { background: linear-gradient(145deg, var(--c1), var(--c2)); color: #fff; }
.wg-home .wg-mega .wg-mega__promo:hover em { transform: translateX(4px); }
@media (max-width: 991.98px) {
  .wg-mega__inner { display: flex; flex-direction: column; gap: 20px; padding: 8px 4px 16px; }
  .wg-mega__cards { grid-template-columns: 1fr; gap: 0; }
  .wg-home .wg-mega .wg-mega__card small { display: none; }
  .wg-home .wg-mega .wg-mega__card { min-height: 44px; justify-content: center; }
  .wg-mega__nums { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .wg-home .wg-mega .wg-mega__nums a { background: rgba(255, 255, 255, .06); border-color: rgba(255, 255, 255, .12); color: #fff; min-height: 48px; }
  .wg-home .wg-mega .wg-mega__nums small, .wg-home .wg-mega .wg-mega__game small { color: #a59fc0; }
  .wg-mega__games, .wg-mega__games--3, .wg-mega__games--4 { grid-template-columns: 1fr 1fr; gap: 4px; }
  .wg-mega__art { width: 34px; height: 34px; border-radius: 10px; border: 0; }
  .wg-mega__art .wg-art { width: 26px; height: 26px; }
  .wg-mega__game b { font-size: 14px; }
  .wg-home .wg-mega .wg-mega__promo { display: none; }
  .wg-home .wg-mega .wg-mega__more { color: #d8b4fe; }
}
@media (max-width: 380px) {
  .wg-mega__games, .wg-mega__games--3, .wg-mega__games--4 { grid-template-columns: 1fr; }
}
.wg-home .wg-header { background: #ffffff !important; border-bottom: 1px solid #e5e2ee !important; box-shadow: 0 1px 3px rgba(30, 27, 46, 0.04) !important; }
.wg-home .wg-header .wg-logo { display: inline-flex; align-items: center; }
.wg-home .wg-header .wg-logo-svg { height: 36px; width: auto; display: block; }
.wg-home .wg-header .wg-logo-svg .st1 { fill: #1e1b2e !important; }
.wg-home .wg-menu__btn, .wg-home .wg-menu__link { color: #1e1b2e !important; white-space: nowrap; font-weight: 700 !important; font-size: 15px; }
.wg-home .wg-menu__btn:hover, .wg-home .wg-menu__link:hover, .wg-home .wg-menu__item.is-open > .wg-menu__btn { background: #f1e9fd !important; color: #6d28d9 !important; }
.wg-home .wg-header .navbar-toggler img { filter: invert(1) !important; }
@media (max-width: 991.98px) {
  .wg-home #navbarSupportedContent { background: #ffffff !important; border-top: 1px solid #e5e2ee !important; }
  .wg-home .wg-menu__item { border-bottom: 1px solid #e5e2ee !important; }
  .wg-home .wg-menu__btn, .wg-home .wg-menu__link { color: #1e1b2e !important; }
}
.wg-home .wg-menu__btn, .wg-home .wg-menu__link { white-space: nowrap; }
@media (max-width: 991.98px) {
  .wg-header__bar { padding: 0 12px 0 16px; }
  .wg-home .wg-header .wg-burger { order: 3; margin-left: auto; }
  .wg-home .wg-header .wg-logo { order: 1; }
}
.wg-home .wg-mega__title { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; font-size: 11.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #7c6f92; }
.wg-home .wg-mega__title::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #b641da; flex: none; }
.wg-home .wg-mega .wg-mega__title--sub { margin: 22px 0 10px; padding-top: 18px; border-top: 1px solid #f0e8fb; }
.wg-home .wg-mega a { text-decoration: none; transition: background .15s, border-color .15s, color .15s, box-shadow .15s, transform .15s; }
.wg-home .wg-mega .wg-mega__card { padding: 12px 14px; gap: 4px; border: 1px solid #f1eafc; border-radius: 14px; background: #fff; color: #1e1b2e; }
.wg-home .wg-mega .wg-mega__card:hover { border-color: #d8b4fe; background: #faf5ff; color: #6d28d9; transform: translateY(-1px); box-shadow: 0 10px 20px -14px rgba(126, 34, 206, .5); }
.wg-home .wg-mega .wg-mega__card small { color: #7c6f92; }
.wg-home .wg-mega .wg-mega__link { justify-content: space-between; min-height: 40px; padding: 8px 12px; border-radius: 10px; font-size: 14.5px; font-weight: 600; color: #1e1b2e; }
.wg-home .wg-mega .wg-mega__link::after { content: "\\2192"; color: #b641da; opacity: 0; transform: translateX(-6px); transition: opacity .15s, transform .15s; }
.wg-home .wg-mega .wg-mega__link:hover { background: #faf5ff; color: #6d28d9; }
.wg-home .wg-mega .wg-mega__link:hover::after { opacity: 1; transform: none; }
.wg-home .wg-mega .wg-mega__nums a { min-height: 54px; border: 1px solid #eee3ff; border-radius: 12px; background: #faf7ff; color: #1e1b2e; justify-content: center; }
.wg-home .wg-mega .wg-mega__nums a:hover { background: linear-gradient(135deg, #b641da, #8c20ad); border-color: transparent; color: #fff; transform: translateY(-1px); box-shadow: 0 10px 18px -10px rgba(140, 32, 173, .8); }
.wg-home .wg-mega .wg-mega__more { display: inline-flex; margin-top: 12px; padding: 8px 14px; border-radius: 999px; background: #f5ecff; color: #7e22ce; font-weight: 800; }
.wg-home .wg-mega .wg-mega__more:hover { background: #7e22ce; color: #fff; }
.wg-home .wg-mega .wg-mega__game { border: 1px solid #f1eafc; border-radius: 14px; background: #fff; color: #1e1b2e; padding: 10px 12px; }
.wg-home .wg-mega .wg-mega__game:hover { border-color: #d8b4fe; background: #faf5ff; color: #6d28d9; box-shadow: 0 10px 20px -14px rgba(126, 34, 206, .5); }
.wg-home .wg-mega .wg-mega__game small { color: #7c6f92; }
@media (min-width: 992px) {
  .wg-home .wg-mega { background: #fff; border: 1px solid #efe7ff; border-top: 0; border-radius: 0 0 22px 22px; box-shadow: 0 38px 60px -30px rgba(44, 10, 90, .4); }
  .wg-home .wg-mega { max-height: min(640px, calc(100vh - 120px)); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #d8b4fe transparent; }
  .wg-home .wg-mega::-webkit-scrollbar { width: 8px; }
  .wg-home .wg-mega::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 8px; }
  .wg-home .wg-mega__inner { gap: 0; padding: 0; }
  .wg-home .wg-mega__col { padding: 26px 28px 28px; }
  .wg-home .wg-mega__col + .wg-mega__col { border-left: 1px solid #f1eafc; }
  .wg-home .wg-mega__inner--solvers { grid-template-columns: 1.7fr 1fr 1.05fr; }
  .wg-home .wg-mega__inner--daily { grid-template-columns: 1fr 1fr 300px; }
  .wg-home .wg-mega__inner--cheats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .wg-home .wg-mega__inner--lists { grid-template-columns: 1fr 1fr 1.3fr 1fr; }
  .wg-home .wg-mega .wg-mega__promo { margin: 18px 18px 18px 6px; }
  .wg-home #mm-lists.wg-mega { max-height: min(780px, calc(100vh - 90px)); }
  .wg-home #mm-lists .wg-mega__col { padding-top: 22px; padding-bottom: 22px; }
  .wg-home #mm-lists .wg-mega__link { min-height: 34px; padding-top: 4px; padding-bottom: 4px; font-size: 14.5px; }
  .wg-home #mm-lists .wg-mega__title--sub { margin: 14px 0 8px; padding-top: 14px; }
  .wg-home .wg-mega__nums { gap: 8px; }
  .wg-home .wg-menu__item:has(#mm-cross) { position: relative; }
  .wg-home #mm-cross.wg-mega { left: 0; right: auto; width: min(560px, 92vw); border-top: 1px solid #efe7ff; border-radius: 0 0 22px 22px; }
  .wg-home #mm-cross .wg-mega__games--4 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
}
@media (min-width: 992px) and (max-width: 1199.98px) {
  .wg-home .wg-mega__col { padding-left: 18px; padding-right: 18px; }
  .wg-home #mm-lists .wg-mega__link { font-size: 13.5px; padding-left: 6px; padding-right: 6px; }
  .wg-home .wg-mega__inner--lists { grid-template-columns: 1fr 1fr 1.25fr .95fr; }
}
@media (min-width: 992px) and (max-width: 1099.98px) {
  .wg-home .wg-menu__btn, .wg-home .wg-menu__link { padding: 0 8px; gap: 4px; font-size: 14px; }
}
@media (max-width: 991.98px) {
  .wg-home .wg-mega { background: transparent; box-shadow: none; border: 0; padding: 0 0 8px; }
  .wg-home .wg-mega__inner { gap: 14px; padding: 4px 0 6px; }
  .wg-home .wg-mega a { color: #1e1b2e !important; }
  .wg-home .wg-mega a:hover { background: #faf5ff; color: #6d28d9 !important; }
  .wg-home .wg-mega__title { margin: 6px 8px 8px; color: #7c6f92; }
  .wg-home .wg-mega .wg-mega__title--sub { margin: 14px 8px 8px; padding-top: 14px; }
  .wg-home .wg-mega .wg-mega__card { border: 0; border-radius: 10px; padding: 10px 12px; min-height: 44px; box-shadow: none; }
  .wg-home .wg-mega .wg-mega__link::after { display: none; }
  .wg-home .wg-mega .wg-mega__link { justify-content: flex-start; }
  .wg-home .wg-mega .wg-mega__nums a { background: #faf7ff; border-color: #eee3ff; color: #1e1b2e !important; }
  .wg-home .wg-mega .wg-mega__nums a:hover { background: #7e22ce; color: #fff !important; }
  .wg-home .wg-mega .wg-mega__nums small, .wg-home .wg-mega .wg-mega__game small, .wg-home .wg-mega a small { color: #7c6f92; }
  .wg-home .wg-mega .wg-mega__nums a:hover small { color: rgba(255, 255, 255, .85); }
  .wg-home .wg-mega .wg-mega__game { border-color: #f1eafc; }
  .wg-home .wg-mega .wg-mega__more { background: #f5ecff; color: #7e22ce !important; }
}
@media (min-width: 992px) {
  .wg-home .wg-mega .wg-mega__promo { min-height: 0; align-self: stretch; border-radius: 16px; }
  .wg-home .wg-mega__inner--solvers { grid-template-columns: 1.5fr 1.15fr 1fr; }
}
@media (min-width: 992px) {
  .wg-home #mm-cross.wg-mega { width: min(480px, 92vw); }
}
/* Site-wide button and link defaults must not leak into the header */
.wg-header { font-family: 'Poppins', sans-serif; }
.wg-header ::before, .wg-header ::after { box-sizing: border-box; }
.wg-home .wg-header button, .wg-home .wg-header button:hover { box-shadow: none; transform: none; border-radius: 10px; }
.wg-home .wg-burger:hover { background: transparent; }
`;

// Second copy of the logo on the page, so its gradient ids must differ
const FOOTER_LOGO = LOGO_SVG.replace(/wgLogoTile/g, "wgLogoTileFooter");

export const SITE_FOOTER_HTML = `<footer class="wg-footer"> <div class="wg-footer__inner"> <div class="wg-footer__brand"> <a href="/" aria-label="Word with letters">${FOOTER_LOGO}</a> <p>Free word solvers, daily hints and puzzle helpers.</p> <div class="wg-footer__social"><a href="https://www.facebook.com/" rel="noopener" target="_blank" aria-label="facebook"><img src="/puzzle-assets/facebook.svg" alt="" width="20" height="20" loading="lazy"></a><a href="https://www.instagram.com/" rel="noopener" target="_blank" aria-label="instagram"><img src="/puzzle-assets/instagram.svg" alt="" width="20" height="20" loading="lazy"></a><a href="https://www.linkedin.com/" rel="noopener" target="_blank" aria-label="linkden"><img src="/puzzle-assets/linkedin.svg" alt="" width="20" height="20" loading="lazy"></a><a href="https://www.twitter.com/" rel="noopener" target="_blank" aria-label="twitter"><img src="/puzzle-assets/twitter.svg" alt="" width="20" height="20" loading="lazy"></a></div> </div><div class="wg-footer__col"><h3>Daily Answers</h3><a href="/nyt-wordle-answer-today">Wordle Answer Today</a><a href="/nyt-connections-hints-answers-today">Connections Hints & Answers</a><a href="/nyt-spelling-bee-answers-today">Spelling Bee Answers</a><a href="/nyt-strands-hints-spangram-answers-today">Strands Hints & Spangram</a><a href="/nyt-pips-hints-answers-today">Pips Hints & Answers</a><a href="/nyt-sudoku-hints-answers-today">NYT Sudoku Hints</a></div><div class="wg-footer__col"><h3>Word Finders</h3><a href="/five-letter-words-with-these-letters">5 Letter Words</a><a href="/x-letter-words-with-letters">Words by Length</a><a href="/anagram-word-finder">Anagram Word Finder</a><a href="/jumble-word-finder">Jumble Word Finder</a><a href="/make-words-with-these-letters">Make Words From Letters</a><h3 class="wg-footer__sub">Other Languages</h3><a href="/french-word-unscrambler">French Word Unscrambler</a><a href="/german-word-unscrambler">German Word Unscrambler</a><a href="/italian-word-unscrambler">Italian Word Unscrambler</a><a href="/spanish-word-unscrambler">Spanish Word Unscrambler</a></div><div class="wg-footer__col"><h3>Tools</h3><a href="/wordle-solver">Wordle Solver</a><a href="/letter-unscrambler-into-words">Word Unscrambler</a><a href="/word-generator-from-letters">Anagram Solver</a><a href="/find-words-with-letters-in-certain-positions">Words in Certain Positions</a><a href="/find-words-that-start-with-the-letters">Words Starting With</a></div><div class="wg-footer__col"><h3>Company</h3><a href="/terms-and-conditions">Terms of use</a><a href="/privacy-policy">Privacy Policy</a><a href="/disclaimer">Disclaimer</a><a href="/about">About</a><a href="/blog/">Blog</a><h3 class="wg-footer__sub">Network sites</h3><a href="/blog" rel="noopener">Blog</a><a href="/allpages" rel="noopener">Popular Pages</a><a href="/vowels" rel="noopener">Vowels</a><a href="/words-with-silent-letters" rel="noopener">Words with silent letters</a><a href="/long-words-with-letters" rel="noopener">Long words with letters</a><a href="/short-words-with-letters" rel="noopener">Short words with letters</a></div> </div> </footer>`;

export const SITE_FOOTER_CSS = /* css */ `
.wg-home {
  --wg-gap: 80px;
}
.wg-footer { margin-top: var(--wg-gap); background: var(--wg-header); color: #cfc9e6; padding: 56px 16px 24px; border-radius: 48px 48px 0 0; }
.wg-footer__inner { display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto; }
.wg-footer__brand p { margin: 16px 0; color: #a59fc0; max-width: 28ch; }
.wg-footer__social { display: flex; gap: 8px; }
.wg-home .wg-footer__social a { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: rgba(255, 255, 255, .08); }
.wg-footer__col { display: flex; flex-direction: column; }
.wg-footer__col h3 { margin: 0 0 12px; color: #fff; font-size: 14px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.wg-footer__sub { margin-top: 24px !important; }
.wg-home .wg-footer__col a { display: block; padding: 6px 0; min-height: 32px; color: #cfc9e6; font-size: 15px; text-decoration: none; }
.wg-home .wg-footer__col a:hover { color: #fff; text-decoration: underline; }
.wg-home .wg-footer + .footer-bottom { background: var(--wg-header) !important; color: #a59fc0 !important; margin: 0 !important; padding: 16px; }
.wg-home .footer-bottom p { color: #a59fc0; }
@media (max-width: 1023.98px) {
  .wg-footer__inner { grid-template-columns: repeat(3, 1fr); }
  .wg-footer__brand { grid-column: 1 / -1; }
}
@media (max-width: 767.98px) {
  .wg-footer { border-radius: 32px 32px 0 0; }
  .wg-footer__inner { grid-template-columns: 1fr 1fr; }
}
.wg-home .wg-footer__col a { min-height: 44px; display: flex; align-items: center; padding: 0; }
.wg-home .wg-footer .wg-logo-svg { height: 32px; width: auto; display: block; }
.wg-home .wg-footer .wg-logo-svg .st1 { fill: #ffffff !important; }
.wg-home .wg-footer .wg-logo-svg .wg-logo-with { fill: #a59fc0; }
.wg-home .wg-footer .wg-logo-svg .wg-logo-accent { fill: #d8b4fe; }
.wg-home .wg-footer + .footer-bottom { display: flex !important; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px 24px; max-width: none; padding: 18px max(16px, calc((100% - 1200px) / 2 + 16px)); }
.wg-home .wg-footer + .footer-bottom p { margin: 0; text-align: left; font-size: 14px; }
.wg-home .wg-footer + .footer-bottom center { display: contents; }
@media (max-width: 767.98px) {
  .wg-home .wg-footer + .footer-bottom { justify-content: center; text-align: center; }
  .wg-home .wg-footer + .footer-bottom p { text-align: center; }
}
.wg-home .wg-footer__col a { line-height: 1.45; padding: 7px 0; }
/* The page wrap already leaves room above the footer */
.wg-home .wg-footer { margin-top: 0; }
.wg-footer, .footer-bottom { font-family: 'Poppins', sans-serif; }
.wg-home .wg-footer a { text-decoration: none; }
`;

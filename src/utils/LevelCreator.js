import { ColRow } from "./ColRow";
import { isEmptyCharAt, isSameCharAt, setCharAt, invertCaseAt, getCharAt, getLowerCount } from "./CharGrid";
import { COLS, ROWS, NEIBS } from "./Config";
import { splitmix32 } from "./Random";
import { readFromObject } from "./Storage";

function nextPosiblePlaces(charPlaces, nextChar, chars, mods) {
  let nextPositions = [];
  let allNextPosition = [];

  if (!charPlaces || charPlaces.length > 0) {
    const lastPos = charPlaces.at(-1);
    for (let neib of NEIBS) {
      allNextPosition.push(ColRow.sum(lastPos, neib));
    }
  } else {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        allNextPosition.push({ col, row });
      }
    }
  }

  for (let pos of allNextPosition) {
    const isEmpty = isEmptyCharAt(pos, chars);
    const isUsed = charPlaces.find((p) => ColRow.isSame(p, pos));
    const isValid = ColRow.isValid(pos);
    const isSameChar = isSameCharAt(pos, chars, nextChar);
    const isAnyMod = isSameCharAt(pos, mods, "*");

    if (isValid && !isUsed && (isEmpty || isSameChar || isAnyMod)) {
      nextPositions.push(pos);
    }
  }
  return nextPositions;
}

function tryAddWord(word, chars, rndFunc, mods) {
  let charPlaces = [];
  let selection = [];
  for (let i = 0; i < word.length; i++) {
    const nextPlaces = nextPosiblePlaces(charPlaces, word.charAt(i), chars, mods);
    if (nextPlaces.length === 0) return { chars, selection };
    const nextPlaceIndex = rndFunc(nextPlaces.length);
    charPlaces.push(nextPlaces[nextPlaceIndex]);
  }

  charPlaces.forEach((pos, i) => {
    if (isEmptyCharAt(pos, chars)) {
      chars = setCharAt(pos, chars, word.charAt(i).toLowerCase());
    } else {
      chars = invertCaseAt(pos, chars);
    }
    selection.push(pos);
  });
  return { chars, selection };
}

function createMods(level, rndFunc) {
  //0 00-07 - no mods
  //1 08-15 - no mods
  //2 16-23 - #
  //3 24-31 - *
  //4 32-39 - ## **
  //5 40-47 - ####
  //6 48-55 - ****
  //7 56-63 - ### ***
  const hashNums = [0, 0, 1, 0, 2, 4, 0, 3];
  const asteNums = [0, 0, 0, 1, 2, 0, 4, 3];
  const hashCount = hashNums[Math.floor(level / 8)];
  const asteCount = asteNums[Math.floor(level / 8)];
  let mods = " ".repeat(COLS * ROWS);

  for (let i = 0; i < hashCount; i++) {
    const col = rndFunc(COLS);
    const row = rndFunc(ROWS);
    mods = setCharAt({ col, row }, mods, "#");
  }
  for (let i = 0; i < asteCount; i++) {
    const col = rndFunc(COLS);
    const row = rndFunc(ROWS);
    mods = setCharAt({ col, row }, mods, "*");
  }
  return mods;
}

function finalizeChars(chars, mods, word, level, rndFunc) {
  //fill all chars after lvl 16, capitalize all #
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const pos = { col, row };
      const char = getCharAt(pos, chars);
      const mod = getCharAt(pos, mods);
      if (mod === "#") {
        chars = setCharAt(pos, chars, char.toUpperCase());
      }
      if (char === " " && level > 31) {
        const charIndex = rndFunc(word.length);
        const newChar = word.charAt(charIndex)
        chars = setCharAt(pos, chars, newChar.toUpperCase());
      }
    }
  }
  return chars;
}

function isSameSelection(sel1, sel2) {
  let sameCount = 0;
  for (let pos1 of sel1) {
    for (let pos2 of sel2) {
      if (ColRow.isSame(pos1, pos2)) {
        sameCount++;
        break;
      }
    }
  }
  return sameCount === sel1.length;
}
function isSelectionInSolution(selection, solution) {

  for (let sel of solution) {
    if (isSameSelection(sel, selection)) {
      return true;
    }
  }
  return false;
}

function getRndFunc(word, level) {
  //level * (word.charCodeAt(0) + word.charCodeAt(1) + ...)
  let wordHash = 0;
  for (let char of word.split("")) {
    wordHash += char.charCodeAt(0);
  }
  wordHash = wordHash * level;
  return splitmix32(wordHash);
}

let levelsCache = {}

export function createLevel(word, level) {
  const levelKey = word + " " + level;
  let levelData = readFromObject(levelsCache, levelKey, null);
  if (levelData !== null) return levelData;

  const rndFunc = getRndFunc(word, level)

  console.log("GENERATING LEVEL FOR", word, level)
  let chars = " ".repeat(COLS * ROWS);
  let mods = createMods(level, rndFunc);
  let solution = [];

  for (let i = 0; i < level + 1 || solution.length === 0 || getLowerCount(chars) < 2; i++) {
    const trial = tryAddWord(word, chars, rndFunc, mods);
    if (trial.selection.length === 0) continue;
    if (isSelectionInSolution(trial.selection, solution)) continue;
    chars = trial.chars;
    solution.push(trial.selection);
  }

  chars = finalizeChars(chars, mods, word, level, rndFunc);
  levelData = { chars, solution, mods };
  levelsCache[levelKey] = levelData;
  return levelData;
}

import { ColRow } from "./ColRow";
import { isEmptyCharAt, isSameCharAt, setCharAt, invertCaseAt, getCharAt } from "./CharGrid";
import { COLS, ROWS, NEIBS } from "./Config";
import { splitmix32 } from "./Random";

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
  //48 levels
  //0 0-7 - no mods
  //1 8-15  -  #
  //2 16-23 -  # *
  //3 24-31 - ## *
  //4 32-39 - ## **
  //5 40-47 - ### ***
  const hashNums = [0, 1, 1, 2, 2, 3];
  const asteNums = [0, 0, 1, 1, 2, 3];
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
      if (char === " " && level > 15) {
        const charIndex = rndFunc(word.length);
        const newChar = word.charAt(charIndex)
        chars = setCharAt(pos, chars, newChar.toUpperCase());
      }
    }
  }
  return chars;
}

export function createLevel(word, level) {
  const rndFunc = splitmix32(level + word.charCodeAt(0) + word.charCodeAt(1));

  //console.log("createLevel", word, level)
  let chars = " ".repeat(COLS * ROWS);
  let mods = createMods(level, rndFunc);
  let solution = [];

  for (let i = 0; i < level + 1; i++) {
    let trial = tryAddWord(word, chars, rndFunc, mods);
    if (trial.selection.length === 0) continue;
    chars = trial.chars;
    solution.push(trial.selection);
  }

  chars = finalizeChars(chars, mods, word, level, rndFunc);
  return { chars, solution, mods };
}

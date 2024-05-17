import { ColRow } from "./ColRow";
import { isEmptyCharAt, isSameCharAt, setCharAt, invertCaseAt } from "./CharGrid";
import { COLS, ROWS, NEIBS } from "./Config";

function splitmix32(a) {
  return function () {
    a |= 0;
    a = a + 0x9e3779b9 | 0;
    let t = a ^ a >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
}

function nextPosiblePlaces(charPlaces, nextChar, chars) {
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

    if (isValid && !isUsed && (isEmpty || isSameChar)) {
      nextPositions.push(pos);
    }
  }
  return nextPositions;
}

function tryAddWord(word, chars, rndFunc) {
  let charPlaces = [];
  let selection = [];
  for (let i = 0; i < word.length; i++) {
    const nextPlaces = nextPosiblePlaces(charPlaces, word.charAt(i), chars);
    if (nextPlaces.length === 0) return { chars, selection };
    const nextPlaceIndex = Math.floor(rndFunc() * nextPlaces.length);
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

export function createLevel(word, level) {
  //console.log("createLevel", word, level)
  let chars = " ".repeat(COLS * ROWS);
  let solution = [];
  const rndFunc = splitmix32(level + word.charCodeAt(0) + word.charCodeAt(1));
  for (let i = 0; i < level + 1; i++) {
    let trial = tryAddWord(word, chars, rndFunc);
    if (trial.selection.length === 0) continue;
    chars = trial.chars;
    solution.push(trial.selection);
  }
  return { chars, solution };
}

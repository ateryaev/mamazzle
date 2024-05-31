import { ColRow } from "./ColRow";
import { getCharAt, isEmptyCharAt, invertCaseAt, getUpperCount, getLowerCount } from "./CharGrid";
import { NEIBS } from "./Config";

export class GamePlay {

  static progress(chars) {
    const solved = getUpperCount(chars);
    const unsolved = getLowerCount(chars);
    const total = solved + unsolved;
    let percent = 0;
    if (total > 0) percent = Math.round(100 * (solved / total));
    return { total, solved, percent };
  }

  static touchAt(pos, chars, selection) { //return new selection
    if (isEmptyCharAt(pos, chars)) return selection;
    if (!ColRow.isValid(pos)) return selection;
    if (selection.length === 0) {
      selection.push(pos);
      return selection.slice(0);
    }

    for (let i = 0; i < selection.length; i++) {
      if (ColRow.isSame(selection[i], pos)) {
        return selection.slice(0, i + 1);
      }
    }

    while (true) {
      const lastPos = selection.at(-1);
      let nextPos = null;
      let nextDist = ColRow.distance(pos, lastPos);

      for (let neib of NEIBS) {
        const neibPos = ColRow.sum(lastPos, neib);

        if (isEmptyCharAt(neibPos, chars)) continue;
        if (!ColRow.isValid(neibPos)) continue;
        if (selection.some((p) => ColRow.isSame(p, neibPos))) continue;

        const neibDist = ColRow.distance(pos, neibPos);
        if (neibDist < nextDist) {
          nextDist = neibDist;
          nextPos = neibPos;
        }
      }
      if (nextPos == null) break;
      selection.push(nextPos);
    }
    return selection.slice(0);
  }

  static selectedWord(chars, selection, mods) {
    return selection.map((pos) => {
      if (mods && getCharAt(pos, mods) === "*") return "*";
      return getCharAt(pos, chars);
    }).join("");
  }

  static invert(chars, selection, mods) {
    for (let pos of selection) {
      if (getCharAt(pos, mods) === "#") continue;
      chars = invertCaseAt(pos, chars);
    }
    return chars;
  }

  static untouch(chars, word, selection, mods) {
    const selectedWord = this.selectedWord(chars, selection, mods).toUpperCase();
    let finalWord = "";
    selectedWord.split("").forEach((char, index) => {
      if (char === "*") {
        char = word.charAt(index);
      }
      finalWord += char;
    });
    const solved = (finalWord.toUpperCase() === word.toUpperCase());
    if (!solved) return chars;
    return this.invert(chars, selection, mods);
  }
}

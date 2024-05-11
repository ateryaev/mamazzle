import { ColRow } from "./ColRow";
import { getCharAt, isEmptyCharAt, invertCaseAt } from "./CharGrid";
import { NEIBS } from "./Config";

export class GamePlay {

  static progress(chars) {
    let total = 0;
    let solved = 0;
    for (let chr of chars) {
      if (chr === " ") continue;
      total++;
      if (chr === chr.toUpperCase()) solved++;
    }
    return { total, solved };
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

  static selectedWord(chars, selection) {
    return selection.map((pos) => getCharAt(pos, chars)).join("");
  }

  static untouch(chars, word, selection) {
    const selectedWord = this.selectedWord(chars, selection).toUpperCase();
    console.log(selectedWord, word.toUpperCase());
    const solved = (selectedWord === word.toUpperCase());
    if (!solved) return chars;
    for (let pos of selection) {
      chars = invertCaseAt(pos, chars);
    }
    return chars;
  }
}

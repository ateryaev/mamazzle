import { COLS, ROWS } from "./Config";

export class ColRow {

  static sum(pos1, pos2) {
    return { col: pos1.col + pos2.col, row: pos1.row + pos2.row }
  }

  static distance(pos1, pos2) {
    return (pos1.col - pos2.col) ** 2 + (pos1.row - pos2.row) ** 2;
  }

  static isSame(pos1, pos2) {
    return (pos1.col === pos2.col) && (pos1.row === pos2.row);
  }

  static isValid({ col, row }) {
    return (col >= 0 && row >= 0 && col < COLS && row < ROWS);
  }

  static fromEvent(htmlEvent, htmlNode) {
    const w = htmlNode.offsetWidth;
    const x = htmlEvent.pageX - htmlNode.offsetLeft;
    const y = htmlEvent.pageY - htmlNode.offsetTop;
    const size = w / COLS;
    const col = Math.floor(x / size);
    const row = Math.floor(y / size);
    return { col, row };
  }

  static fromIndex(index) {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return { col, row };
  }
};

import { COLS } from "./Config";

export function isSameCharAt(pos, chars, char) {
  return getCharAt(pos, chars).toLowerCase() === char.toLowerCase();
}
export function isEmptyCharAt(pos, chars) {
  return isSameCharAt(pos, chars, " ");
}
export function getCharAt(pos, chars) {
  const index = pos.row * COLS + pos.col;
  return chars.charAt(index);
}
export function setCharAt(pos, chars, char) {
  const index = pos.row * COLS + pos.col;
  if (index > chars.length - 1) return;
  return chars.substring(0, index) + char + chars.substring(index + 1);
}
export function invertCaseAt(pos, chars) {
  const current = getCharAt(pos, chars);
  const isLow = (current === current.toLowerCase());
  const action = isLow ? current.toUpperCase : current.toLowerCase;
  return setCharAt(pos, chars, action.bind(current)());
}

import { createContext } from "react";
import { COLS, ROWS } from "./utils/Config";

function createHistoryItem() {
  return {
    history: [/* array of chars for level 0*/],
    index: 0,
    solution: [/* */]
  };
}
function createWordItem(word) {
  return {
    word,
    progress: 0, //number of solved levels
    setProgress: (n) => { this.progress = n; },
    played: 0, //last played level
    'history_0': createHistoryItem(),
    'history_2': createHistoryItem()
  };
}

export const Ctx = createContext({
  words: [
    createWordItem("mama"),
    createWordItem("radar"),
    createWordItem("cocoa"),
    createWordItem("bamboo"),
    createWordItem("coffee"),
  ]

});

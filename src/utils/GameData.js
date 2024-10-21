import { createLevel } from "./LevelCreator";
import { GamePlay } from "./GamePlay"
import { loadFromLocalStorage, readFromObject, saveToLocalStorage } from "./Storage";

let data = { history: {}, progress: {}, skipped: [], page: {}, settings: {}, lastPlayed: {} };

export function getLastPlayed(word) { return readFromObject(data.lastPlayed, word, -1); }
export function updateLastPlayed(word, level) { data.lastPlayed[word] = level; }

function loadAll() {
  if (data.loaded) return;
  data.settings = loadFromLocalStorage('mamazzle_settings', { sound: true, vibro: true });
  data.progress = loadFromLocalStorage('mamazzle_progress', {});
  data.skipped = loadFromLocalStorage('mamazzle_skipped', []);
  console.log("LOAD", data.settings, data.progress, data.skipped);
  data.loaded = true;
}

function saveAll() {
  console.log("SAVE", data.settings, data.progress);
  saveToLocalStorage('mamazzle_settings', data.settings);
  saveToLocalStorage('mamazzle_progress', data.progress);
  saveToLocalStorage('mamazzle_skipped', data.skipped);
}

export function getSettings() {
  loadAll();
  return data.settings;
}

export function updateSettings({ sound, vibro }) {
  data.settings = { sound, vibro };
  saveAll();
}

export function getWords() {
  return ["mama", "radar", "cocoa", "bamboo", "coffee"];
}

function getWordIndex(word) {
  const words = getWords();
  let index = -1;
  for (let i = 0; i < words.length; i++) {
    if (words[i] === word) {
      index = i;
      break;
    }
  }
  return index;
}

export function isPlayable(word, level) {
  if (`${level * 1}` !== `${level}`) return false;
  level = level * 1;
  if (level < 0) return false;
  const index = getWordIndex(word);
  if (index < 0 || getLeftToUnlock(index) > 0) return false;
  const levelsSolved = getLevelsSolved(word);
  return (level <= levelsSolved);
}

export function getWordAbout(word) {
  switch (word) {
    case "mama": return "Mama embodies an irreplaceable source of warmth and guidance, a beacon of unconditional love and strength. In her embrace, there's comfort, in her wisdom, solace, for she's the eternal nurturer, shaping hearts with tenderness and resilience."
    case "radar": return "Radar revolutionized navigation and detection, transcending mere technology to become a symbol of foresight and awareness. With its ability to pierce through darkness and distance, it stands as a testament to human ingenuity and our quest to extend the boundaries of perception."
    case "cocoa": return "Cocoa evokes images of indulgent warmth and rich flavors, a sensory journey through lush tropical landscapes. From its humble bean to decadent treats, cocoa embodies both simplicity and sophistication, weaving its way into cultures and cuisines, delighting palates and uplifting spirits with each velvety sip or sumptuous bite."
    case "bamboo": return "Bamboo epitomizes nature's versatility and resilience, with its slender stalks bending but never breaking in the winds of change. From sturdy construction material to delicate crafts, it symbolizes adaptability and sustainability, flourishing in diverse ecosystems while offering a myriad of practical and artistic possibilities, rooted in ancient traditions yet embracing modern innovation."
    case "coffee": return "Coffee is more than a beverage. It's a ritual, a conversation starter, and a global connector. From the first sip of its bold aroma to the last lingering taste, coffee invigorates the senses and sparks creativity. It's the fuel of early mornings and late nights, a companion in solitude and a catalyst for camaraderie. Across cultures and continents, coffee culture thrives, weaving tales of cultivation, craftsmanship, and community around each cherished cup."
  }
  return "No data about " + word + ".";
}

export function getLevelsSolved(word) {
  loadAll();
  return readFromObject(data.progress, word, 0);
}

export function updateLevelsSolved(word, levels) {
  const oldProgress = getLevelsSolved(word);
  if (levels > oldProgress) {
    data.progress[word] = levels;
    saveAll();
  }
}

export function setSkipped(word, level) {
  //only last level can be skipped
  if (level !== getLevelsSolved(word)) return;
  //check if already skipped
  for (let level of data.skipped) {
    if (level.word === word && level.level === level) return;
  }
  data.skipped.push({ word, level });
  updateLevelsSolved(word, level + 1);
  saveAll();
}

export function isLevelSkipped(word, level) {
  loadAll();
  for (let skipped of data.skipped) {
    if (skipped.word === word && skipped.level === level) return true;
  }
  return false;
}

export function getSkippedLevels(word) {
  loadAll();
  return data.skipped.filter((level) => level.word === word).map((level) => level.level);
}

export function getTotalLevelsSolved() {
  const words = getWords();
  let total = 0;
  for (let w of words) {
    total += getLevelsSolved(w);
  }
  return total;
}

export function getLeftToUnlock(levelIndex) {
  const needs = [0, 8, 32, 64, 128, 256];
  if (levelIndex >= needs.length) return 999999;
  const solved = getTotalLevelsSolved();
  const needed = needs[levelIndex];
  return solved >= needed ? 0 : needed - solved;
}

function getHistoryKey(word, level) { return word + " " + level; }

export function getLevelHistory(word, level) {
  const levelData = createLevel(word, level);
  const historyKey = getHistoryKey(word, level);

  if (data.history[historyKey]) {
    return { ...data.history[historyKey], solution: levelData.solution, mods: levelData.mods };
  }

  return { history: [levelData.chars], slot: 0, solution: levelData.solution, mods: levelData.mods };
}

export function updateLevelHistory(word, level, { history, slot }) {
  data.history[getHistoryKey(word, level)] = { history: history.slice(), slot };
  if (GamePlay.progress(history[slot]).percent === 100) {
    data.skipped = data.skipped.filter((wordlevel) => wordlevel.word !== word || wordlevel.level !== level);
    console.log(data.skipped);
    updateLevelsSolved(word, level + 1);
    saveAll();
  }
}

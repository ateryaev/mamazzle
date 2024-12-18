import { createLevel } from "./LevelCreator";
import { GamePlay } from "./GamePlay"
import { loadFromLocalStorage, readFromObject, saveToLocalStorage } from "./Storage";

let data = { history: {}, progress: {}, skipped: [], page: {}, settings: {}, lastPlayed: {} };

export function getLastPlayed(word) { return readFromObject(data.lastPlayed, word, -1); }
export function updateLastPlayed(word, level) { data.lastPlayed[word] = level; }

function loadAll() {
  if (data.loaded) return;
  data.settings = loadFromLocalStorage('mamazzle_settings', { sound: true, vibro: true, dark: false });
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

export function updateSettings({ sound, vibro, dark }) {
  data.settings = { sound, vibro, dark };
  saveAll();
}

export function getWords() {
  return ["mama", "radar", "cocoa", "bamboo", "coffee", "freeze"];
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
    case "freeze": return 'Freeze captures the stillness and transformative power of cold, halting movement and preserving moments in time. Whether it’s the frost that coats winter landscapes or the preservation of food and memories, freezing symbolizes both fragility and endurance, a pause in nature that often prepares for growth and renewal.'
    default: return "Nothing to say..."
  }
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

export function calculateScore() {
  let total = 0;

  const mainWords = getWords().slice(0, 5);
  for (let w of mainWords) {
    total += (getLevelsSolved(w) - getSkippedCount(w)) * 100;
  }

  const seasWords = getWords().slice(5)
  for (let w of seasWords) {
    total += (getLevelsSolved(w) - getSkippedCount(w)) * 25;
  }
  return total;
}

export function syncWithCloud(cloud) {

  console.log("SYNCING WITH CLOUD: ", cloud)

  // cloud = {
  //   progress: { "radar": 0, "mama": 11 },
  //   skipped: [{ word: "radar", level: 57 }, { word: "mama", level: 7 }, { word: "mama", level: 10 }]
  // }

  const words = getWords()

  let newSkipped = []
  let newProgress = {}

  try {
    for (let w of words) {
      const wpr1 = data.progress[w] || 0;
      const wpr2 = cloud.progress[w] || 0;
      const wprMax = Math.max(wpr1, wpr2);
      const wprMin = Math.min(wpr1, wpr2);

      newProgress[w] = wprMax;

      for (let lvl = 0; lvl < wprMax; lvl++) {
        const skippedInData = isskipped(w, lvl, data.skipped);
        const skippedInCloud = isskipped(w, lvl, cloud.skipped);
        if (lvl < wprMin && skippedInData && skippedInCloud) {
          newSkipped.push({ word: w, level: lvl });
        } else if (lvl >= wprMin && (skippedInData || skippedInCloud)) {
          newSkipped.push({ word: w, level: lvl });
        }
      }
    }
  } catch (e) {
    newSkipped = data.skipped;
    newProgress = data.progress;
  }

  console.log("newSkipped", ...newSkipped)
  console.log("newProgress", newProgress)

  data.skipped = newSkipped;
  data.progress = newProgress;
  saveAll();

  return { skipped: newSkipped, progress: newProgress };
}


function unskip(word, level, skippedArray) {
  return skippedArray.filter((wordlevel) => wordlevel.word !== word || wordlevel.level !== level);
}

function isskipped(word, level, skippedArray) {
  for (let skipped of skippedArray) {
    if (skipped.word === word && skipped.level === level) return true;
  }
}

export function setSkipped(word, level) {
  //only last level can be skipped
  if (level !== getLevelsSolved(word)) return;
  //check if already skipped
  if (isskipped(word, level, data.skipped)) return;
  data.skipped.push({ word, level });
  updateLevelsSolved(word, level + 1);
  saveAll();
}

export function isLevelSkipped(word, level) {
  loadAll();
  return isskipped(word, level, data.skipped);
}

export function getSkippedCount(word) {
  loadAll();
  let count = 0;
  for (let skipped of data.skipped) {
    if (skipped.word === word) count++;
  }
  return count;
}

export function getTotalSkippedCount() {
  loadAll();
  return data.skipped.length;
}


export function getSkippedLevels(word) {
  loadAll();
  return data.skipped.filter((level) => level.word === word).map((level) => level.level);
}

export function getTotalLevelsSolved() {
  const words = getWords().slice(0, 5);
  let total = 0;
  for (let w of words) {
    total += getLevelsSolved(w);
  }
  return total;
}

export function getLeftToUnlock(levelIndex) {
  const needs = [0, 8, 32, 64, 128, 0];
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
    data.skipped = unskip(word, level, data.skipped);
    //data.skipped = data.skipped.filter((wordlevel) => wordlevel.word !== word || wordlevel.level !== level);
    console.log(data.skipped);
    updateLevelsSolved(word, level + 1);
    saveAll();
  }
}

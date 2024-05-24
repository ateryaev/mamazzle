import { createLevel } from "./LevelCreator";
import { GamePlay } from "./GamePlay"

//data.progress to save to localStorage
let data = { history: {}, progress: {}, page: {} };

export function GetGameWords() {
  //Ideas: "cocos", "coffee", "raccoon", "tartar", "alpha"
  return ["mama", "radar", "cocoa", "bamboo", "coffee"];
}

export function GetWordAbout(word) {
  switch (word) {
    case "mama": return "Mama embodies an irreplaceable source of warmth and guidance, a beacon of unconditional love and strength. In her embrace, there's comfort, in her wisdom, solace, for she's the eternal nurturer, shaping hearts with tenderness and resilience."
    case "radar": return "Radar revolutionized navigation and detection, transcending mere technology to become a symbol of foresight and awareness. With its ability to pierce through darkness and distance, it stands as a testament to human ingenuity and our quest to extend the boundaries of perception."
    case "cocoa": return "Cocoa evokes images of indulgent warmth and rich flavors, a sensory journey through lush tropical landscapes. From its humble bean to decadent treats, cocoa embodies both simplicity and sophistication, weaving its way into cultures and cuisines, delighting palates and uplifting spirits with each velvety sip or sumptuous bite."
    case "bamboo": return "Bamboo epitomizes nature's versatility and resilience, with its slender stalks bending but never breaking in the winds of change. From sturdy construction material to delicate crafts, it symbolizes adaptability and sustainability, flourishing in diverse ecosystems while offering a myriad of practical and artistic possibilities, rooted in ancient traditions yet embracing modern innovation."
    case "coffee": return "Coffee is more than a beverage. It's a ritual, a conversation starter, and a global connector. From the first sip of its bold aroma to the last lingering taste, coffee invigorates the senses and sparks creativity. It's the fuel of early mornings and late nights, a companion in solitude and a catalyst for camaraderie. Across cultures and continents, coffee culture thrives, weaving tales of cultivation, craftsmanship, and community around each cherished cup."
  }
  return "No data about " + word + ".";
}

export function LoadLevelsSolved(word) {
  //console.log("SOLVED", word)
  if (data.progress[word]) {
    return data.progress[word];
  }
  if (word === "mama") return 48;
  if (word === "radar") return 31;
  if (word === "cocoa") return 7;
  return 0;
}

export function SaveLevelsSolved(word, levels) {
  //console.log("SaveLevelsSolved...", { word, levels });
  const oldProgress = LoadLevelsSolved(word);
  if (levels > oldProgress) {
    console.log("NEW LEVEL SOLVED!", word, levels);
    data.progress[word] = levels;
  }
}


function Load(field, word, defaultValue) { if (!data[field]) data[field] = {}; return data[field].hasOwnProperty(word) ? data[field][word] : defaultValue; }
function Save(field, word, value) { if (!data[field]) data[field] = {}; data[field][word] = value; }

export function LoadLastPlayed(word) { return Load("lastPlayed", word, -1); }
export function SaveLastPlayed(word, level) { Save("lastPlayed", word, level); }

export function TotalLevelsSolved() {
  const words = GetGameWords();
  let total = 0;
  for (let w of words) {
    total += LoadLevelsSolved(w);
  }
  return total;
}

export function LeftToUnlock(levelIndex) {
  const needs = [0, 8, 32, 64, 128, 256];
  const solved = TotalLevelsSolved();
  const needed = needs[levelIndex];
  return solved >= needed ? 0 : needed - solved;
}

export function LoadLevelHistory(word, level) {
  const levelData = createLevel(word, level);

  if (data.history[word + " " + level]) {
    return { ...data.history[word + " " + level], solution: levelData.solution, mods: levelData.mods };
  }

  const history = [levelData.chars];
  const slot = 0;
  //console.log("LOADING...", levelData.mods)
  return { history, slot, solution: levelData.solution, mods: levelData.mods };
}

export function SaveLevelHistory(word, level, { history, slot }) {
  //console.log("SAVING...", { word, level })
  data.history[word + " " + level] = { history: history.slice(), slot };

  if (GamePlay.progress(history[slot]).percent === 100) {
    //console.log("SAVING SOLVED...", { word, level })
    SaveLevelsSolved(word, level + 1);
  }

}

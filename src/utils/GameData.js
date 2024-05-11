import { createLevel } from "./LevelCreator";

//data.progress to save to localStorage

let data = { history: {}, progress: {}, page: {} };

export function GetGameWords() {
  console.log("GetGameWords...")
  return ["mama", "radar", "tattoo", "baby", "tartar"];
}

export function LoadLevelsSolved(word) {
  if (data.progress[word]) {
    return data.progress[word];
  }
  return 0;
}

export function SaveLevelsSolved(word, levels) {
  console.log("SaveLevelsSolved...", { word, levels });
  const oldProgress = LoadLevelsSolved(word);
  if (levels > oldProgress) {
    console.log("NEW LEVEL SOLVED!", word, levels);
    data.progress[word] = levels;
  }
}

export function LoadWordPage(word) {
  console.log("LoadWordPage...", word)
  if (data.page[word]) {
    return data.page[word];
  }
  return 0;
}
export function SaveWordPage(word, page) {
  console.log("SaveWordPage...", { word, page })
  data.page[word] = page;
}

export function LoadLevelHistory(word, level) {
  if (data.history[word + " " + level]) {
    return { ...data.history[word + " " + level] };
  }
  const history = [createLevel(word, level)];
  const slot = 0;
  return { history, slot };
}

export function SaveLevelHistory(word, level, { history, slot }) {
  data.history[word + " " + level] = { history: history.slice(), slot };
}

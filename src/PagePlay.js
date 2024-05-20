import { Block, IconRedo, IconUndo, BlockTitle, RoundButton, ProgressBar, Button, BlockAlarm } from "./components/Ui";
import { Board } from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { GamePlay } from "./utils/GamePlay";
import { LoadLevelHistory, LoadLevelsSolved, SaveLastPlayed, SaveLevelHistory } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Window } from "./components/Window";
import { IconBxsHandUp } from "./components/Icons";
import { LEVELS_PER_WORD } from "./utils/Config";
import { beepSwipe, beepSwipeComplete } from "./utils/Beep";


export function PagePlay({ onSolved }) {
  const navigate = useNavigate();
  const routerParam = useParams();
  //console.log("PAGE RENDER");
  const word = routerParam.word;
  const level = routerParam.lvl * 1;

  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const [history, setHistory] = useState(LoadLevelHistory(word, level).history);
  const [mods, setMods] = useState(LoadLevelHistory(word, level).mods);
  const [historySlot, setHistorySlot] = useState(LoadLevelHistory(word, level).slot);

  const [selection, setSelection] = useState([]);
  const solution = useMemo(() => LoadLevelHistory(word, level).solution, [word, level]);

  const chars = useMemo(() => history[historySlot], [history, historySlot]);
  const selectedWord = useMemo(() => { return GamePlay.selectedWord(chars, selection, mods) }, [selection, chars, mods]);
  const solvedBefore = useMemo(() => { return level < LoadLevelsSolved(word) }, [level, word]);
  const progress = useMemo(() => GamePlay.progress(GamePlay.invert(chars, selection, mods)).percent, [chars, selection]);
  const solved = useMemo(() => GamePlay.progress(chars).percent === 100, [chars]);
  const canDemo = useMemo(() => !demoMode && historySlot === 0 && selection.length === 0, [demoMode, historySlot, selection]);

  function addSlot(newChars) {
    let newHistory = history.slice(0, historySlot + 1);
    let newSlot = historySlot + 1;
    newHistory.push(newChars);
    setHistorySlot(newSlot);
    setHistory(newHistory);
    SaveLevelHistory(word, level, { history: newHistory, slot: newSlot });
  }

  function changeSlot(newSlot) {
    setHistorySlot(newSlot);
    SaveLevelHistory(word, level, { history: history, slot: newSlot });
  }

  function handleSelectEnd() {
    const newChars = GamePlay.untouch(chars, word, selection, mods);
    setSelection([]);
    if (newChars !== chars) {
      addSlot(newChars);
      beepSwipeComplete();
    }
  }

  function handleSelecting(pos) {
    const preLength = selection.length;
    const newSelection = GamePlay.touchAt(pos, chars, selection);
    //console.log("SWIPE", newSelection.length, selection.length)
    if (newSelection.length != preLength) {
      beepSwipe();
      console.log("SWIPE")
    }
    setSelection(newSelection);
  }

  function handleUndo() { changeSlot(historySlot - 1); }
  function handleRedo() { changeSlot(historySlot + 1); }
  function handleBack() { navigate(-1); }
  function restart() { changeSlot(0); }
  function goNext() { navigate(`/play/${word}/${level + 1}`, { replace: true }); }
  useEffect(() => {
    //TODO: check if word/level unlocked
    SaveLastPlayed(word, level);
  }, [word, level]);

  useEffect(() => {
    if (!demoMode) return;
    const stepLen = word.length + 1;
    const solutionIndex = Math.floor(demoStep / stepLen);
    const subIndex = demoStep % stepLen;

    const tmo = setTimeout(() => {
      if (demoStep >= solution.length * stepLen || solved) {
        clearInterval(tmo);
        console.log("DEMO OVER!");
        setDemoMode(false);
        return;
      }

      setDemoStep(demoStep + 1);

      if (subIndex < stepLen - 1) {
        console.log("DEMO MOVE:", solution[solutionIndex][subIndex], subIndex)
        handleSelecting(solution[solutionIndex][subIndex]);
      } else {
        handleSelectEnd();
      }
    }, (subIndex === word.length) ? 300 : (subIndex === 1 ? 200 : 100));

    return () => clearTimeout(tmo);
  }, [demoMode, demoStep, selection, solution]);

  function showMeHow() {
    setDemoStep(0);
    setDemoMode(!demoMode);
  }
  return (

    <Window onBack={handleBack} title={<div>
      {word}
      <span className="opacity-60 px-2">/</span>{level.toString().padStart(2, '0')}
      <div className="h-0 text-sm text-right opacity-60 lowercase translate-y-[-8px]">
        {solvedBefore ? "was solved" : "never solved"}
      </div>
    </div>}>

      {solved &&
        <Block>
          <BlockAlarm>Congratulation</BlockAlarm>
        </Block>}

      {!solved && <Block>
        <BlockTitle>
          {selectedWord.length > 0 && word.split("").map((char, index) => (
            <div key={index}
              data-empty={index >= selectedWord.length}
              data-invalid={selectedWord.charAt(index) !== "*" && selectedWord.charAt(index).toLowerCase() !== word.charAt(index).toLowerCase()}
              className="aspect-square uppercase bg-gray-600 text-gray-50 w-[30px] flex justify-center items-center
              data-[empty=true]:bg-gray-50 data-[empty=true]:text-gray-200
              data-[empty=false]:data-[invalid=true]:bg-red-600">
              {index < selectedWord.length ? selectedWord.charAt(index) : "?"}
            </div>
          ))
          }
          {selectedWord.length === 0 && <div className="uppercase">swipe over the word</div>}
        </BlockTitle>
      </Block>}

      <Board chars={chars} mods={mods} word={word} selection={selection}
        onSelecting={handleSelecting} onSelectEnd={handleSelectEnd} readonly={demoMode || solved} />

      {canDemo &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2">
          <Button onClick={showMeHow}>
            <div>
              SHOW ME HOW TO PLAY
              <Blinker className="text-sm opacity-90 h-0 mt-[-2px] block"><IconBxsHandUp className="mx-auto" /></Blinker>
            </div>
          </Button>
        </div>}

      {solved && !demoMode &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2">
          <Button onClick={restart}>RESTART</Button>
          <Button disabled={level + 1 >= LEVELS_PER_WORD} onClick={goNext}>
            <div>
              NEXT
              {level + 1 < LEVELS_PER_WORD && <Blinker className="text-sm opacity-90 h-0 mt-[-2px] block">
                <IconBxsHandUp className="mx-auto" /></Blinker>}
            </div>
          </Button>
        </div>}

      {demoMode && !canDemo && <Block><BlockAlarm>DEMO MODE</BlockAlarm></Block>}
      {!demoMode && !canDemo && !solved && <ProgressBar percent={progress} />}

      <div className="flex justify-center gap-2 p-2 xbg-white">
        <RoundButton disabled={historySlot === 0 || demoMode} onClick={handleUndo}>
          <IconUndo />
        </RoundButton>
        <RoundButton disabled={historySlot === history.length - 1 || demoMode} onClick={handleRedo}>
          <IconRedo />
        </RoundButton>
      </div>

    </Window>
  )
}

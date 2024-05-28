import { Block, IconRedo, IconUndo, BlockTitle, RoundButton, ProgressBar, Button, BlockAlarm } from "./components/Ui";
import { Board } from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { GamePlay } from "./utils/GamePlay";
import { LoadLevelHistory, LoadLevelsSolved, SaveLastPlayed, SaveLevelHistory } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Window } from "./components/Window";
import { IconAsterisk, IconBxsHandUp } from "./components/Icons";
import { LEVELS_PER_WORD } from "./utils/Config";
import { beepSolve, beepSwipe, beepSwipeCancel, beepSwipeComplete } from "./utils/Beep";
import { Selection } from "./components/Selection";


export function PagePlay({ }) {
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
  const canDemo = useMemo(() => level < 6 && !demoMode && historySlot === 0 && selection.length === 0, [demoMode, historySlot, selection]);

  // useEffect(()=>{

  // }, [solved])
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

    if (newChars !== chars) {
      addSlot(newChars);
      beepSwipeComplete();
      if (GamePlay.progress(newChars).percent === 100) {
        beepSolve();
      }
    } else if (selection.length > 1) {
      beepSwipeCancel();
    }
    setSelection([]);
  }

  function handleSelecting(pos) {
    const preLength = selection.length;
    const newSelection = GamePlay.touchAt(pos, chars, selection).slice(0, word.length);
    if (newSelection.length != preLength) {
      beepSwipe(newSelection.length);
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

      {solved && <Block><BlockAlarm>Level Solved</BlockAlarm></Block>}

      {!solved && <Selection selected={selectedWord} needed={word}></Selection>}

      <Board chars={chars} mods={mods} word={word} selection={selection}
        onSelecting={handleSelecting} onSelectEnd={handleSelectEnd}
        readonly={demoMode || solved} solved={solved} />

      {canDemo &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2 rounded-md">
          <Button onClick={showMeHow}>
            <div>
              SHOW ME HOW TO PLAY
              <Blinker className="text-sm opacity-90 h-0 mt-[-2px] block"><IconBxsHandUp className="mx-auto" /></Blinker>
            </div>
          </Button>
        </div>}

      {solved && !demoMode &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2 rounded-md">
          <Button onClick={restart}>RESTART</Button>
          <Button disabled={level + 1 >= LEVELS_PER_WORD} onClick={goNext}>
            <div>
              NEXT
              {level + 1 < LEVELS_PER_WORD && <Blinker className="text-sm opacity-90 h-0 mt-[-2px] block">
                <IconBxsHandUp className="mx-auto" /></Blinker>}
            </div>
          </Button>
        </div>}

      {demoMode && !canDemo && <Block><BlockTitle>DEMO MODE</BlockTitle></Block>}
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

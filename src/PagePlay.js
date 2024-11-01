import { Block, BlockTitle, RoundButton, ProgressBar, Button, BlockAlarm } from "./components/Ui";
import { IconRedo, IconUndo, IconBxsHandUp } from "./components/Icons"
import { Board } from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { GamePlay } from "./utils/GamePlay";
import { isPlayable, getLevelHistory, getLevelsSolved, updateLastPlayed, updateLevelHistory, setSkipped, isLevelSkipped } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Window } from "./components/Window";
import { LEVELS_PER_WORD } from "./utils/Config";
import { beepSolve, beepSwipe, beepSwipeCancel, beepSwipeComplete } from "./utils/Beep";
import { Selection } from "./components/Selection";

function SkipLevelButton({ onSkip }) {

  const [rewardIsAvailable, setRewardIsAvailable] = useState(false);
  const [adIsReady, setAdIsReady] = useState(false);

  function onSkipClick() {
    window.adInterface.collectReward();
    if (onSkip) onSkip();
  }

  function onShowClick() {
    window.adInterface.showAd();
  }

  useEffect(() => {
    const tmo = setInterval(() => {
      setRewardIsAvailable(window.adInterface.isRewardAvailable());
      setAdIsReady(window.adInterface.isAdLoaded());
    }, 500);
    return () => clearInterval(tmo);
  }, []);

  if (rewardIsAvailable) {
    return (
      <div className="-m-1 z-10 h-0 flex items-end justify-end">
        <button className="px-2 py-[2px] shadow-md 
      border-button border-2 text-button text-xs  mx-0 -my-6
      rounded-full bg-white flex justify-center items-center gap-1
      active:bg-button active:text-white 
        " onClick={onSkipClick}>
          skip level <Blinker times={6}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle-arrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" /><path d="M16 12l-4 -4" /><path d="M16 12h-8" /><path d="M12 16l4 -4" /></svg></Blinker>
        </button>
      </div >
    )
  }
  if (adIsReady) {
    return (
      <div className="-m-1 z-10 h-0 flex items-end justify-end">
        <button className="px-2 py-[2px] shadow-md 
      border-button border-2 text-button text-xs  mx-0 -my-6
      rounded-full bg-white flex justify-center items-center gap-1
      active:bg-button active:text-white 
      " onClick={onShowClick}>watch
          ad
          to skip level
          <Blinker times={6}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-external-link"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>
          </Blinker>
        </button>
      </div>
    )
  }
  return (<></>);
}

export function PagePlay({ }) {
  const navigate = useNavigate();
  const routerParam = useParams();

  const word = routerParam.word;
  const level = routerParam.lvl * 1;

  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const [history, setHistory] = useState(getLevelHistory(word, level).history);
  const [mods, setMods] = useState(getLevelHistory(word, level).mods);
  const [historySlot, setHistorySlot] = useState(getLevelHistory(word, level).slot);

  const [selection, setSelection] = useState([]);
  const solution = useMemo(() => getLevelHistory(word, level).solution, [word, level]);

  const chars = useMemo(() => history[historySlot], [history, historySlot]);
  const selectedWord = useMemo(() => { return GamePlay.selectedWord(chars, selection, mods) }, [selection, chars, mods]);



  const progress = useMemo(() => GamePlay.progress(GamePlay.invert(chars, selection, mods)).percent, [chars, selection]);
  const solved = useMemo(() => GamePlay.progress(chars).percent === 100, [chars]);
  const isEasyLevel = useMemo(() => level < 6, [level]);
  const canDemo = useMemo(() => isEasyLevel && !demoMode && historySlot === 0 && selection.length === 0, [demoMode, historySlot, selection, isEasyLevel]);

  const wasSkipped = useMemo(() => { return isLevelSkipped(word, level) }, [level, word, solved]);
  const wasSolved = useMemo(() => { return !isLevelSkipped(word, level) && level < getLevelsSolved(word) }, [level, word, solved]);
  const isNew = useMemo(() => { return level === getLevelsSolved(word) }, [level, word, solved]);

  function addSlot(newChars) {
    let newHistory = history.slice(0, historySlot + 1);
    let newSlot = historySlot + 1;
    newHistory.push(newChars);
    setHistorySlot(newSlot);
    setHistory(newHistory);
    updateLevelHistory(word, level, { history: newHistory, slot: newSlot });
  }

  function changeSlot(newSlot) {
    setHistorySlot(newSlot);
    updateLevelHistory(word, level, { history: history, slot: newSlot });
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
    }
    setSelection(newSelection);
  }

  function handleUndo() { changeSlot(historySlot - 1); }
  function handleRedo() { changeSlot(historySlot + 1); }
  function handleBack() { navigate(-1); }
  function restart() { changeSlot(0); }
  function goNext() { navigate(`/play/${word}/${level + 1}`, { replace: true }); }

  function skipLevel() {
    setSkipped(word, level);
    goNext();
  }

  useEffect(() => {
    if (!isPlayable(word, level)) {
      navigate("/", { replace: true });
      return;
    }
    updateLastPlayed(word, level);
  }, [word, level]);

  useEffect(() => {
    if (!demoMode) return;
    const stepLen = word.length + 1;
    const solutionIndex = Math.floor(demoStep / stepLen);
    const subIndex = demoStep % stepLen;

    const tmo = setTimeout(() => {
      if (demoStep >= solution.length * stepLen || solved) {
        clearInterval(tmo);
        setDemoMode(false);
        return;
      }

      setDemoStep(demoStep + 1);

      if (subIndex < stepLen - 1) {
        handleSelecting(solution[solutionIndex][subIndex]);
      } else {
        handleSelectEnd();
      }
    }, (subIndex === word.length) ? 500 : (subIndex <= 1 ? 300 : 100));

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
        {wasSkipped && "was skipped"}
        {wasSolved && "was solved"}
        {isNew && "never solved"}
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

      {!isEasyLevel && isNew &&
        <SkipLevelButton onSkip={skipLevel} />}

      {!demoMode && !canDemo && !solved && <ProgressBar percent={progress} />}


      {!isEasyLevel && false && isNew &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2 rounded-md">
          <Button onClick={skipLevel}>
            <div className="uppercase mt-[-8px]">
              SKIP level
              <Blinker className="text-sm opacity-90 h-0 mt-[-8px] block lowercase">watch ad</Blinker>
            </div>
          </Button>
        </div>}


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

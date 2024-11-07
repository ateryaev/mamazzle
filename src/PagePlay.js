import { Block, BlockTitle, RoundButton, ProgressBar, Button, BlockAlarm } from "./components/Ui";
import { IconRedo, IconUndo, IconBxsHandUp, IconSkip, IconShowAd } from "./components/Icons"
import { Board } from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { GamePlay } from "./utils/GamePlay";
import { isPlayable, getLevelHistory, getLevelsSolved, updateLastPlayed, updateLevelHistory, setSkipped, isLevelSkipped, getSkippedCount } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Window } from "./components/Window";
import { LEVELS_PER_WORD, MAX_WORD_LEVELS_CAN_SKIP } from "./utils/Config";
import { beepSolve, beepSwipe, beepSwipeCancel, beepSwipeComplete } from "./utils/Beep";
import { Selection } from "./components/Selection";

function CannotSkipLabel({ children }) {
  return (
    <div className="p-1 text-gray-600 opacity-20 text-sm text-center">{children}</div>
  )
}

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
    function checkStatus() {
      setRewardIsAvailable(window.adInterface.isRewardAvailable());
      setAdIsReady(window.adInterface.isAdLoaded());
    }
    const tmo = setInterval(checkStatus, 500);
    checkStatus();
    return () => clearInterval(tmo);
  }, []);

  if (rewardIsAvailable) {
    return (
      <button key={"buttonSkip"} onClick={onSkipClick} className="flex justify-center items-center p-1 text-sm gap-1 rounded-full text-button 
      active:bg-white active:bg-opacity-20 active:brightness-125">
        skip level <Blinker times={6}><IconSkip /></Blinker>
      </button>
    )
  }

  if (adIsReady) {
    return (
      <button key={"buttonWatch"} onClick={onShowClick} className="flex justify-center items-center p-1 text-sm gap-1 rounded-full text-button 
       active:brightness-125 active:bg-white active:bg-opacity-20">
        watch ad to skip level <Blinker times={6}><IconShowAd /></Blinker>
      </button >
    )
  }
  return <CannotSkipLabel>cannot skip - no ads available</CannotSkipLabel>
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
  const skippedCount = useMemo(() => getSkippedCount(word), [word, level, solved])

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

      {!isEasyLevel && isNew && skippedCount < MAX_WORD_LEVELS_CAN_SKIP && <SkipLevelButton onSkip={skipLevel} />}
      {!isEasyLevel && isNew && skippedCount >= MAX_WORD_LEVELS_CAN_SKIP && <CannotSkipLabel>too many skipped already</CannotSkipLabel>}
      {!demoMode && !canDemo && !solved && <Block><ProgressBar percent={progress} /></Block>}

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

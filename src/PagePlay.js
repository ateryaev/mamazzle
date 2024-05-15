import { Title, Block, IconRedo, IconUndo, BlockTitle, RoundButton, ProgressBar, Button, BlockAlarm } from "./components/Ui";
import { Board } from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { GamePlay } from "./utils/GamePlay";
import { LoadLevelHistory, LoadLevelsSolved, SaveLevelHistory, SaveLevelsSolved } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Window } from "./components/Window";

const EMPTY_HISTORY = [" ".repeat(25)];

export function PagePlay({ onSolved }) {
  const navigate = useNavigate();
  const routerParam = useParams();
  //console.log("PAGE RENDER");
  const word = routerParam.word;
  const level = routerParam.lvl * 1;
  const [solvedBefore, setSolvedBefore] = useState(false);
  const [solved, setSolved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [history, setHistory] = useState(EMPTY_HISTORY);
  const [historySlot, setHistorySlot] = useState(0);
  const [selectedWord, setSelectedWord] = useState("");
  const [selection, setSelection] = useState([]);
  const [solution, setSolution] = useState([]);

  useEffect(() => {
    const h = LoadLevelHistory(word, level);
    console.log("11111111", word, level, h.history[0], h.solution);
    setSolution(h.solution);
    setSolvedBefore(level < LoadLevelsSolved(word));
    setHistory(h.history);
    setHistorySlot(h.slot);
    setLoaded(true);
  }, [routerParam]);

  useEffect(() => {
    console.log("22222222:", loaded, history[0]);
    if (!loaded) return;

    SaveLevelHistory(word, level, { history, slot: historySlot });
    setSolved(progress === 100);
    if (progress === 100) {
      SaveLevelsSolved(word, level + 1);
      setSolvedBefore(true);
    }
  }, [history, historySlot]);

  const progress = useMemo(() => {

    const prg = GamePlay.progress(history[historySlot]);
    if (prg.total === 0) return 0;
    const percent = 100 * (prg.solved / prg.total);
    console.log("MEMO LOAD", percent);
    return percent;
  }, [history, historySlot])

  function handleSwap(newChars) {
    let newHistory = history.slice(0, historySlot + 1);
    newHistory.push(newChars);
    setHistorySlot(newHistory.length - 1);
    setHistory(newHistory);
  }

  function handleSelectEnd() {
    const newChars = GamePlay.untouch(history[historySlot], word, selection);
    setSelection([]);
    setSelectedWord("");
    if (newChars !== history[historySlot]) handleSwap(newChars);
  }
  function handleSelecting(pos) {
    const newSelection = GamePlay.touchAt(pos, history[historySlot], selection);
    setSelectedWord(GamePlay.selectedWord(history[historySlot], selection));
    setSelection(newSelection);
  }
  function handleUndo() {
    setHistorySlot(historySlot - 1);
  }
  function handleRedo() {
    setHistorySlot(historySlot + 1);
  }
  function handleBack() {
    navigate(-1);
  }
  function restart() {
    setSolved(false);
    setHistorySlot(0);
  }
  function goNext() {
    navigate(`/play/${word}/${level + 1}`, { replace: true });
  }
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (!demoMode) return;
    const stepLen = word.length + 2;
    const solutionIndex = Math.floor(demoStep / stepLen);
    const subIndex = demoStep % stepLen;

    const tmo = setTimeout(() => {
      if (demoStep >= solution.length * stepLen || progress === 100) {
        clearInterval(tmo);
        console.log("DEMO OVER!");
        setDemoMode(false);
        setDemoStep(0);
        return;
      }

      if (subIndex > 0 && subIndex < stepLen - 1) {
        const pos = solution[solutionIndex][subIndex - 1];
        handleSelecting(pos);
      }
      if (subIndex === stepLen - 1) {
        handleSelectEnd();
      }
      setDemoStep(demoStep + 1);
    }, (subIndex === 0 || subIndex === stepLen - 1) ? 500 : 100);

    return () => clearTimeout(tmo);
  }, [demoMode, demoStep, selection, solution]);

  function showMeHow() {
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

      {solved && selectedWord.length === 0 &&
        <Block>
          <BlockAlarm>Congratulation</BlockAlarm>
        </Block>}

      {(!solved || selectedWord.length > 0) && <Block>
        <BlockTitle>
          {selectedWord.length > 0 && word.split("").map((char, index) => (
            <div key={index}
              data-empty={index >= selectedWord.length}
              data-invalid={selectedWord.charAt(index).toLowerCase() !== word.charAt(index).toLowerCase()}
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

      {/* <Board chars={history[historySlot]} word={word} onSwap={handleSwap} onSelect={handleSelect} /> */}
      <Board chars={history[historySlot]} word={word} selection={selection}
        onSelecting={handleSelecting} onSelectEnd={handleSelectEnd} readonly={demoMode || solved} />

      {historySlot === 0 && selection.length === 0 &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2">
          <Button onClick={showMeHow}>
            <div>SHOW ME HOW TO PLAY
              <Blinker className="text-xs opacity-50 h-0 -translate-y-1 block">tap</Blinker>
            </div>
          </Button>
        </div>}

      {solved &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2">
          <Button onClick={restart}>RESTART</Button>
          <Button onClick={goNext}>
            <div>NEXT
              <Blinker className="text-xs h-0 opacity-50 -translate-y-1 block">tap</Blinker></div></Button>
        </div>}

      {!solved && (historySlot > 0 || selection.length > 0) &&
        <>
          {demoMode && <Block><BlockAlarm>DEMO MODE</BlockAlarm></Block>}
          {!demoMode && <ProgressBar percent={progress} />}
        </>
      }

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

import { Window, Title, Block, IconRedo, IconUndo, BlockTitle, RoundButton, ProgressBar, Button, BlockAlarm } from "./components/Ui";
import { Board } from "./components/Board";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { GamePlay } from "./utils/GamePlay";
import { LoadLevelHistory, LoadLevelsSolved, SaveLevelHistory, SaveLevelsSolved } from "./utils/GameData";

const EMPTY_HISTORY = [" ".repeat(25)];

export function PagePlay({ }) {
  const navigate = useNavigate();
  const routerParam = useParams();
  console.log("PAGE RENDER");
  const word = routerParam.word;
  const level = routerParam.lvl * 1;
  const [solvedBefore, setSolvedBefore] = useState(false);
  const [solved, setSolved] = useState(false);
  const [history, setHistory] = useState(EMPTY_HISTORY);
  const [historySlot, setHistorySlot] = useState(0);
  const [selectedWord, setSelectedWord] = useState("");

  useEffect(() => {
    console.log("11111111", word, level);
    const h = LoadLevelHistory(word, level);
    setSolvedBefore(level < LoadLevelsSolved(word));
    setHistory(h.history);
    setHistorySlot(h.slot);
  }, [routerParam]);

  useEffect(() => {
    console.log("22222222");
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

  function handleUndo() {
    setHistorySlot(historySlot - 1);
  }
  function handleRedo() {
    setHistorySlot(historySlot + 1);
  }
  function handleBack() {
    navigate(`/play/${word}`);
  }
  function handleSelect(selection) {
    setSelectedWord(GamePlay.selectedWord(history[historySlot], selection));
  }
  function restart() {
    setHistorySlot(0);
  }
  function goNext() {
    navigate(`/play/${word}/${level + 1}`);
  }
  return (
    <Window>
      <Title onBack={handleBack}>
        <div>
          {word}
          <span className="opacity-60 px-2">/</span>{level.toString().padStart(2, '0')}
          <div className="h-0 text-sm text-right opacity-60 lowercase translate-y-[-8px]">
            {solvedBefore ? "was solved" : "never solved"}
          </div>
        </div>
      </Title>
      {solved && selectedWord.length === 0 &&
        <Block>
          <BlockAlarm><div className="animate-pulse">Congratulation!</div></BlockAlarm>
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
          {selectedWord.length === 0 && <div className="uppercase">swipe the word</div>}
        </BlockTitle>
      </Block>}

      <Board chars={history[historySlot]} word={word} onSwap={handleSwap} onSelect={handleSelect} />

      {solved &&
        <div className=" bg-white flex justify-stretch items-stretch p-2 gap-2">
          <Button onClick={restart}>retstart</Button>
          <Button onClick={goNext}>next</Button>
        </div>}
      {!solved && <ProgressBar percent={progress} />}

      <div className="flex justify-center gap-2 p-2 xbg-white">
        <RoundButton disabled={historySlot === 0} onClick={handleUndo}>
          <IconUndo />
        </RoundButton>
        <RoundButton disabled={historySlot === history.length - 1} onClick={handleRedo}>
          <IconRedo />
        </RoundButton>
      </div>

    </Window >
  )
}

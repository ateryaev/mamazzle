import { Block, BlockTitle, BlockBody, DotPages, Button, BlockAlarm } from "./components/Ui";
import { useParams, useNavigate } from "react-router-dom";
import { getWordAbout, IsGameWordValid, isPlayable, getLastPlayed } from "./utils/GameData";
import { useEffect, useRef, useState } from "react";
import { getLevelsSolved } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";
import { Blinker } from "./components/Blinker";
import { Window } from "./components/Window";

const pageSize = 16;

function LevelButton({ num, active, unsolved, isLast, onSelect }) {
  const lvl = num.toString().padStart(2, '0');
  return (
    <Button onClick={() => active && onSelect(num)} disabled={!active}>
      <div className="aspect-square flex-1 flex items-center justify-center">
        <div className="flex-1">
          {lvl}
          {active && unsolved && <Blinker className="block text-xs h-0 -translate-y-1 opacity-90" >new</Blinker>}
        </div>
      </div>
      {isLast &&
        <div className="w-0 self-stretch opacity-50">
          <div className="bg-white w-2 h-2 rounded-full -mt-2"></div>
        </div>}
    </Button>
  )
}

function LevelsPage({ start, solved, total, onSelect, lastPlayed }) {
  const size = total - start < pageSize ? total - start : pageSize;

  return (
    <div className="inline-block snap-start w-[100%] flex-1 aspect-square mr-4 snap-always">
      <div className="grid grid-cols-4 gap-2 p-2">
        {[...Array(size)].map((_, index) => (
          <LevelButton key={index}
            onSelect={onSelect}
            num={start + index}
            isLast={lastPlayed === start + index}
            active={start + index <= solved}
            unsolved={start + index == solved} />
        ))}
      </div>
    </div>
  )
}


export function PageLevels({ }) {
  const routerParam = useParams();

  const pageCount = Math.floor((LEVELS_PER_WORD + pageSize - 1) / pageSize);
  const lastPlayed = getLastPlayed(routerParam.word);
  const solvedCount = getLevelsSolved(routerParam.word);
  let levelToFocus = 0;
  if (lastPlayed >= 0) levelToFocus = lastPlayed;
  else if (solvedCount > 0) levelToFocus = solvedCount - 1;
  let currentPage = Math.floor(levelToFocus / pageSize);
  if (currentPage >= pageCount) currentPage = pageCount - 1;

  const scroller = useRef(null);

  const [pageIndex, setPageIndex] = useState(currentPage);
  const [nextPageIndex, setNextPageIndex] = useState(currentPage);

  const navigate = useNavigate();

  function handleBack() { navigate(-1); }
  function handlePlay(lvl) { navigate(`./${lvl}`); }

  function changePage(index) {
    scroller.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  useEffect(() => {
    if (!isPlayable(routerParam.word, 0)) {
      navigate("/", { replace: true });
    }
    scroller.current.children[currentPage].scrollIntoView({ block: 'nearest' });
  }, []);

  useEffect(() => {
    changePage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPageIndex(nextPageIndex);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [nextPageIndex]);

  function handleScroll(e) {
    const nearestPage = pageCount * scroller.current.scrollLeft / scroller.current.scrollWidth;
    setNextPageIndex(Math.round(nearestPage));
  }

  return (<Window onBack={handleBack} title={<>{routerParam.word}</>}>
    <Block>
      {solvedCount < LEVELS_PER_WORD && <BlockTitle>CHOOSE A LEVEL</BlockTitle>}
      {solvedCount >= LEVELS_PER_WORD && <BlockAlarm>ALL LEVELS SOLVED</BlockAlarm>}
    </Block>

    <div className="overflow-x-scroll h-fit text-nowrap snap-x snap-mandatory bg-white rounded-md"
      onScroll={handleScroll} ref={scroller}>
      {[...Array(pageCount)].map((_, index) => (
        <LevelsPage
          key={index}
          onSelect={handlePlay}
          start={index * pageSize}
          lastPlayed={lastPlayed}
          solved={getLevelsSolved(routerParam.word)}
          total={LEVELS_PER_WORD} />
      ))}
    </div>

    <DotPages pageCount={pageCount} currentPage={pageIndex} onClick={changePage} />

    <Block>
      <BlockTitle>ABOUT</BlockTitle>
      <BlockBody>{getWordAbout(routerParam.word)}</BlockBody>
    </Block>
  </Window>
  )
}

import { Title, Block, BlockTitle, BlockBody, DotPages, Button } from "./components/Ui";
import { useParams, useNavigate } from "react-router-dom";
import { GetWordAbout, LoadWordPage, SaveWordPage } from "./utils/GameData";
import { useContext, useEffect, useRef, useState } from "react";
import { LoadLevelsSolved } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";
import { Blinker } from "./components/Blinker";
import { Ctx } from "./Ctx";
import { Window } from "./components/Window";

const pageSize = 16;

function LevelButton({ num, active, unsolved, onSelect }) {
  const lvl = num.toString().padStart(2, '0');
  return (
    <Button onClick={() => active && onSelect(num)} disabled={!active}>
      <div className="aspect-square flex-1 flex items-center justify-center">
        <div>
          {lvl}
          {active && unsolved && <Blinker className="block text-xs h-0 -translate-y-1 opacity-50" >new</Blinker>}
        </div>
      </div>
    </Button>
  )
}

function LevelsPage({ start, solved, total, onSelect }) {
  const size = total - start < pageSize ? total - start : pageSize;
  return (
    <div className="inline-block snap-start w-[100%] flex-1 aspect-square
    mr-4 p-0 snap-always">
      <div className="grid grid-cols-4 gap-2 p-2">
        {[...Array(size)].map((_, index) => (
          <LevelButton key={index}
            onSelect={onSelect}
            num={start + index}
            active={start + index <= solved}
            unsolved={start + index == solved} />
        ))}
      </div>
    </div>
  )
}


export function PageLevels({ }) {
  const routerParam = useParams();

  const scroller = useRef(null);

  const pageCount = Math.floor((LEVELS_PER_WORD + pageSize - 1) / pageSize);

  const [pageIndex, setPageIndex] = useState(LoadWordPage(routerParam.word));
  const [nextPageIndex, setNextPageIndex] = useState(LoadWordPage(routerParam.word));

  const navigate = useNavigate();

  function handleBack() {
    navigate(-1);
  }

  useEffect(() => {
    console.log("W", routerParam.word);
  }, [routerParam.word]);

  function handlePlay(lvl) {
    navigate(`./${lvl}`);
  }

  function changePage(index) {
    console.log("index", index);
    scroller.current.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  useEffect(() => {
    scroller.current.children[LoadWordPage(routerParam.word)].scrollIntoView({ block: 'nearest' });
  }, []);

  useEffect(() => {
    SaveWordPage(routerParam.word, pageIndex);
    scroller.current.children[pageIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      <BlockTitle>CHOOSE A LEVEL</BlockTitle>
    </Block>
    <div>
      <div className="overflow-x-scroll text-nowrap snap-x snap-mandatory bg-white"
        onScroll={handleScroll} ref={scroller}>
        {[...Array(pageCount)].map((_, index) => (
          <LevelsPage
            key={index}
            onSelect={handlePlay}
            start={index * pageSize}
            solved={LoadLevelsSolved(routerParam.word)}
            total={LEVELS_PER_WORD} />
        ))}
      </div>
    </div>
    <DotPages pageCount={pageCount} currentPage={pageIndex} onClick={changePage} />

    <Block>
      <BlockTitle>ABOUT</BlockTitle>
      <BlockBody>{GetWordAbout(routerParam.word)}</BlockBody>
    </Block>
  </Window>
  )
}

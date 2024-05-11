import { Window, Title, Block, BlockTitle, BlockBody, DotPages, Button } from "./components/Ui";
import { useParams, useNavigate } from "react-router-dom";
import { LoadWordPage, SaveWordPage } from "./utils/GameData";
import { useEffect, useRef, useState } from "react";
import { LoadLevelsSolved } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";

const pageSize = 16;

function LevelButton({ num, active, unsolved, onSelect }) {
  const lvl = num.toString().padStart(2, '0');
  return (
    <Button onClick={() => active && onSelect(num)} disabled={!active}>
      <div className="aspect-square bxg-red-100 flex-1 flex items-center justify-center">
        <div>
          {lvl}
          {active && unsolved && <div className="text-xs h-0 animate-pulse">new</div>}
        </div>
      </div>
    </Button>
  )
}

function LevelsPage({ start, solved, total, onSelect }) {
  const size = total - start < pageSize ? total - start : pageSize;
  console.log(size);

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
    navigate('/');
  }

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

  return (
    <Window>
      <Title onBack={handleBack}>{routerParam.word}</Title>
      <Block>
        <BlockTitle>CHOOSE LEVELS</BlockTitle>
      </Block>

      <div className="overflow-x-auto text-nowrap snap-x snap-mandatory bg-white"
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
      <DotPages pageCount={pageCount} currentPage={pageIndex} onClick={changePage} />

      <Block>
        <BlockTitle>ABOUT</BlockTitle>
        <BlockBody>
          Some text about current word.
          <br />As example:<br />
          The practice of tattooing dates back thousands of
          years and has been found in different cultures across
          the globe. Studying the history of tattooing provides
          insights into human culture, beliefs, and social
          practices throughout history.
        </BlockBody>
      </Block>
    </Window >
  )
}

import { Window, Block, MainTitle, BlockTitle, BlockBody, Button } from "./components/Ui";
import { useNavigate } from "react-router-dom";
import { GetGameWords } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";
import { LoadLevelsSolved } from "./utils/GameData";

function WordButton({ word, solved, total, onClick }) {
  return (
    <Button onClick={onClick}>
      <div className="uppercase flex-1 text-left">{word}</div>
      <div className="">{solved}/{total}</div>
    </Button>
  )
}

export function PageMain({ }) {
  const navigate = useNavigate();
  const words = GetGameWords();

  function handleClick(word) {
    navigate(`/play/${word}`);
  }
  return (
    <Window>
      <MainTitle>mamazzle<br />puzzle</MainTitle>

      <Block><BlockTitle>CHOOSE THE WORD</BlockTitle></Block>

      <Block>
        {words.map((word) => (
          <WordButton key={word}
            word={word}
            solved={LoadLevelsSolved(word)}
            total={LEVELS_PER_WORD} onClick={() => handleClick(word)} />
        ))}
      </Block>

      <Block>
        <BlockTitle>HOW TO PLAY</BlockTitle>
        <BlockBody>
          Swipe words to highlight all letters on the field. You can connect nearest letters in any directions.
          <br />
          Highlighted letter can be selected again. But after that they will return in off state.
        </BlockBody>
      </Block>
    </Window>
  )
}

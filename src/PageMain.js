import { Block, BlockTitle, BlockBody, Button } from "./components/Ui";
import { Window } from "./components/Window";
import { useNavigate } from "react-router-dom";
import { GetGameWords, LeftToUnlock } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";
import { LoadLevelsSolved } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Item } from "./components/Board";
import { useEffect, useState } from "react";

function WordButton({ word, solved, total, leftToUnlock, onClick }) {
  const disabled = leftToUnlock > 0;
  return (
    <Button onClick={onClick} disabled={disabled}>
      <div className="uppercase flex-1 text-left xfont-bold">
        {word}
        {!disabled && solved === 0 && <Blinker className=" block text-xs h-0 opacity-90 lowercase -translate-y-1">new</Blinker>}
        {disabled && <div className="text-xs h-0 lowercase translate-y-[-4px]">solve {leftToUnlock} to unlock</div>}
      </div>
      {!disabled && <div className="">{solved}/{total}</div>}
      {disabled && <div className="text-xs">locked</div>}
    </Button>
  )
}

export function PageMain({ }) {
  const navigate = useNavigate();

  function handleClick(word) {
    navigate(`/play/${word}`);
  }

  return (
    <Window title={<>mamazzle<br />puzzle</>}>
      <Block><BlockTitle>CHOOSE A WORD</BlockTitle></Block>

      <Block>
        {GetGameWords().map((word, index) => (
          <WordButton key={word}
            word={word}
            solved={LoadLevelsSolved(word)}
            leftToUnlock={LeftToUnlock(index)}
            total={LEVELS_PER_WORD} onClick={() => handleClick(word)} />
        ))}

      </Block>

      <Block>
        <BlockTitle>HOW TO PLAY</BlockTitle>
        <BlockBody>
          Welcome to our exciting puzzle game!
          <ol className="nu nu list-none py-4 list-inside lis gap-1">
            <li><i>Select Word and Level:</i> Choose your word and the level you want to tackle.</li>
            <li><i>Goal:</i> Your objective is to colorize all the letters on the game field.</li>
            <li><i>How to Play:</i>
              <ul className="ml-4">
                <li>Spot the word you're playing.
                  <div className="grid grid-cols-4 gap-2 p-4 px-10 font-bold">
                    <Item char={"m"} index={0} selected={false} selectionTo={null} />
                    <Item char={"A"} index={1} selected={false} selectionTo={null} />
                    <Item char={"m"} index={0} selected={false} selectionTo={null} />
                    <Item char={"a"} index={1} selected={false} selectionTo={null} />
                  </div>
                </li>
                <li>Swipe over the word to connect nearest letters in any direction - up, down, left, or right.
                  <div className="grid grid-cols-4 gap-2 p-4 px-10 font-bold">
                    <Item char={"m"} index={0} selected={true} selectionTo={"right"} />
                    <Item char={"A"} index={1} selected={true} selectionTo={"right"} />
                    <Item char={"m"} index={0} selected={true} selectionTo={"right"} />
                    <Item char={"a"} index={1} selected={true} selectionTo={null} />
                  </div>
                </li>
                <li>Swipe right to trigger a change in the state of all the letters in that word.
                  <div className="grid grid-cols-4 gap-2 p-4 px-10 font-bold">
                    <Item char={"M"} index={0} selected={false} selectionTo={null} />
                    <Item char={"a"} index={1} selected={false} selectionTo={null} />
                    <Item char={"M"} index={0} selected={false} selectionTo={null} />
                    <Item char={"A"} index={1} selected={false} selectionTo={null} />
                  </div>

                </li>
                <li>Once you've completed the swipe, the letters of the word will change their state to the opposite.</li>
              </ul>
            </li>
            <li><i>Highlighted Letters:</i> You can select highlighted letters again, but they will return to their off state afterward.</li>
          </ol>
          Get ready to dive into the challenge and see how fast you can colorize the entire game field!

        </BlockBody>
      </Block>
    </Window>
  )
}

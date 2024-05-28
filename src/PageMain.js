import { Block, BlockTitle, BlockBody, Button } from "./components/Ui";
import { Window } from "./components/Window";
import { useNavigate } from "react-router-dom";
import { GetGameWords, GetSettings, LeftToUnlock, LoadSettings, SaveSettings, UpdateSettings } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";
import { LoadLevelsSolved } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Item, ItemAny, ItemLocked } from "./components/Board";
import { IconBxsLockAlt } from "./components/Icons";
import { useState } from "react";

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
      {disabled && <div className=""><IconBxsLockAlt /> </div>}
    </Button>
  )
}

export function PageMain({ }) {
  const navigate = useNavigate();
  const [sound, setSound] = useState(GetSettings().sound);
  const [vibro, setVibro] = useState(GetSettings().vibro);

  function handleClick(word) {
    navigate(`/play/${word}`);
  }

  function handleSoundSwitch() {
    UpdateSettings({ sound: !sound, vibro })
    setSound(!sound);
  }

  function handleVibroSwitch() {
    UpdateSettings({ sound, vibro: !vibro })
    setVibro(!vibro);
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
          Spot the word you're playing.
          Swipe over the word to connect nearest letters in any direction - up, down, left, or right.
          Swipe right to trigger a change in the state of all the letters in that word.
          <div className="grid grid-cols-4 gap-2 px-8 scale-50 font-bold">
            <Item char={"m"} index={0} selected={false} selectionTo={null} />
            <Item char={"A"} index={1} selected={false} selectionTo={null} />
            <Item char={"m"} index={0} selected={false} selectionTo={null} />
            <Item char={"a"} index={1} selected={false} selectionTo={null} />
          </div>

          <div className="grid grid-cols-4 gap-2 px-8 scale-50  font-bold">
            <Item char={"m"} index={0} selected={true} selectionTo={"right"} />
            <Item char={"A"} index={1} selected={true} selectionTo={"right"} />
            <Item char={"m"} index={0} selected={true} selectionTo={"right"} />
            <Item char={"a"} index={1} selected={true} selectionTo={null} />
          </div>

          <div className="grid grid-cols-4 gap-2 px-8 scale-50 font-bold">
            <Item char={"M"} index={0} selected={false} selectionTo={null} />
            <Item char={"a"} index={1} selected={false} selectionTo={null} />
            <Item char={"M"} index={0} selected={false} selectionTo={null} />
            <Item char={"A"} index={1} selected={false} selectionTo={null} />
          </div>

          Once you've completed the swipe, the letters of the word will change their state to the opposite.
          You can select highlighted letters again, but they will return to their off state afterward.

          <h2 className="text-center block font-semibold py-2">Item Types</h2>

          <div className="flex items-center gap-2 py-2">
            <div className="scale-50 -m-[15px] font-bold w-[60px] h-[60px]">
              <Item char={"F"} index={3} selected={false} selectionTo={null} />
            </div>
            <div className="flex-1">- regular item</div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <div className="scale-50 -m-[15px] font-bold w-[60px] h-[60px]">
              <ItemLocked char={"R"} index={2} selected={false} selectionTo={null} />
            </div>
            <div className="flex-1">- this item is always on</div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <div className="scale-50 -m-[15px] font-bold w-[60px] h-[60px]">
              <ItemAny char={"R"} index={0} selected={false} selectionTo={null} />
            </div>
            <div className="flex-1">- can be any letter</div>
          </div>

          <h2 className="text-center block font-semibold py-2">Goal</h2>
          Your objective is to colorize all the letters on the game field.
          Solve all levels and words to become mamaster.
        </BlockBody>
      </Block>

      <Block>
        <BlockTitle>Settings</BlockTitle>
        <Button onClick={handleSoundSwitch}>
          <div className="flex w-full">
            <div className="flex-1 text-left">Sound effects</div>
            <div>{sound ? "ON" : "OFF"}</div>
          </div>
        </Button>
        <Button onClick={handleVibroSwitch}>
          <div className="flex w-full">
            <div className="flex-1 text-left">Vibration</div>
            <div>{vibro ? "ON" : "OFF"}</div>
          </div>
        </Button>
      </Block>
    </Window>
  )
}

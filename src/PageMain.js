import { Block, BlockTitle, BlockBody, Button, BlockAlarm } from "./components/Ui";
import { Window } from "./components/Window";
import { useNavigate } from "react-router-dom";
import { getWords, getSettings, getLeftToUnlock, updateSettings, getSkippedCount, getTotalLevelsSolved, calculateScore } from "./utils/GameData";
import { LEVELS_PER_WORD } from "./utils/Config";
import { getLevelsSolved } from "./utils/GameData";
import { Blinker } from "./components/Blinker";
import { Item, ItemAny, ItemLocked } from "./components/Board";
import { IconAsterisk, IconBxsLockAlt, IconStar } from "./components/Icons";
import { useState } from "react";
import { preBeepButton } from "./utils/Beep";
import { PlayGamesBlock } from "./components/PlayGamesBlock";
import { flushSync } from "react-dom";

function WordButton({ word, solved, skipped, total, leftToUnlock, onClick }) {
  const disabled = leftToUnlock > 0;
  return (
    <Button onClick={onClick} disabled={disabled}>
      <div className="uppercase flex-1 text-left -my-2">
        <div className="text-xs invisible -my-1">&nbsp;</div>
        {word}
        <div className="text-xs -my-1">
          {!disabled && solved === 0 &&
            <Blinker className="bg-white text-button px-1 py-[1px] text-[9px] rounded-sm bg-opacity-50">
              NEW
            </Blinker>}
          {disabled && <span className="lowercase opacity-60">solve {leftToUnlock} to unlock</span>}
          &nbsp;
        </div>
      </div>

      {!disabled && <div className="text-right -my-2">
        <div className="text-xs invisible -my-1">&nbsp;</div>
        {solved}/{total}
        <div className="text-xs -my-1 opacity-60">
          &nbsp;
          {skipped > 0 && <>{skipped} skipped</>}
        </div>
      </div>}

      {disabled && <IconBxsLockAlt />}
    </Button >
  )
}

export function PageMain() {
  const navigate = useNavigate();
  const [sound, setSound] = useState(getSettings().sound);
  const [vibro, setVibro] = useState(getSettings().vibro);
  const [dark, setDark] = useState(getSettings().dark);
  const [showHelp, setShowHelp] = useState(false);

  function handleClick(word) {
    document.startViewTransition(() => {
      flushSync(() => {
        navigate(`/play/${word}`);
      });
    });

  }

  function handleSoundSwitch() {
    updateSettings({ sound: !sound, vibro })
    setSound(!sound);
  }

  function handleVibroSwitch() {
    updateSettings({ sound, vibro: !vibro })
    setVibro(!vibro);
    preBeepButton();
  }
  function handleThemeSwitch() {
    updateSettings({ sound, vibro, dark: !dark })
    window.changeTheme(!dark)
    setDark(!dark);
    preBeepButton();
  }
  return (
    <Window title={<>mamazzle<br />puzzle</>}>
      {getTotalLevelsSolved() < 64 * 5 && <Block><BlockTitle>CHOOSE A WORD</BlockTitle></Block>}

      {getTotalLevelsSolved() === 64 * 5 &&
        <Block><BlockAlarm>YOU ARE MAMASTER</BlockAlarm></Block>}
      <Block>
        {getWords().slice(0, 5).map((word, index) => (
          <WordButton key={word}
            word={word}
            solved={getLevelsSolved(word)}
            skipped={getSkippedCount(word)}
            leftToUnlock={getLeftToUnlock(index)}
            total={LEVELS_PER_WORD} onClick={() => handleClick(word)} />
        ))}

        <div className="text-xs text-center text-gray-400 text-opacity-60 flex justify-center">
          <IconAsterisk />
          <IconAsterisk />
          <IconAsterisk />
        </div>
        {getWords().slice(5).map((word) => (
          <Button onClick={() => handleClick(word)} special={!true} key={word}>
            <div className="uppercase flex-1 text-left -my-2">
              <div className="text-xs lowercase opacity-50 -my-1">&nbsp;</div>
              {word}
              <div className="text-xs lowercase opacity-60 -my-1">season word</div>
            </div>
            <div className="text-right -my-2">
              <div className="text-xs invisible -my-1">&nbsp;</div>
              {getLevelsSolved(word)}/{LEVELS_PER_WORD}
              <div className="text-xs -my-1 opacity-60">
                &nbsp;
                {getSkippedCount(word) > 0 && <>{getSkippedCount(word)} skipped</>}
              </div>
            </div>
          </Button>
        ))}
      </Block>

      <PlayGamesBlock />
      <Block>
        <BlockTitle>HOW TO PLAY</BlockTitle>
        <BlockBody>
          Spot the word you're playing.
          Swipe over the word to connect nearest letters in any direction - up, down, left, or right.
          Swipe right to trigger a change in the state of all the letters in that word.

          {showHelp && (<div>
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
            Solve all levels and words to become Mamaster.
          </div>)}

          <button onClick={() => { setShowHelp(!showHelp) }}
            className="block border border-button rounded-sm
            text-button bg-button bg-opacity-10 min-w-20
            px-2 mx-auto mt-4 py-px text-xs active:opacity-50 text-nowrap">
            {showHelp ? "show less" : "show more"}
          </button>

        </BlockBody>
      </Block>

      <Block>
        <BlockTitle>Settings</BlockTitle>
        <Button onClick={handleSoundSwitch} className="">
          <div className="flex-1 text-left">Sound Effects</div>
          <div className="flex gap-0 w-24  bg-white bg-opacity-20 rounded-sm overflow-hidden">
            <div className="text-xs flex-1 px-1 bg-white text-button min-w-8 data-[disabled=true]:bg-transparent" data-disabled={sound}>OFF</div>
            <div className="text-xs flex-1 px-1 bg-white text-button min-w-8 data-[disabled=true]:bg-opacity-0" data-disabled={!sound}>ON</div>
          </div>
        </Button>
        <Button onClick={handleVibroSwitch}>
          <div className="flex-1 text-left">Vibration</div>
          <div className="flex text-xs w-24 gap-0 bg-white bg-opacity-20 rounded-sm overflow-hidden">
            <div className="px-1 flex-1 bg-white text-button min-w-8 data-[disabled=true]:bg-transparent" data-disabled={vibro}>OFF</div>
            <div className="px-1 flex-1 bg-white text-button min-w-8 data-[disabled=true]:bg-opacity-0" data-disabled={!vibro}>ON</div>
          </div>

        </Button>

        <Button onClick={handleThemeSwitch}>
          <div className="flex-1 text-left">Color Mode</div>
          <div className="flex text-xs w-24 gap-0 bg-white bg-opacity-20 rounded-sm overflow-hidden">
            <div className="px-1 flex-1 bg-white text-button min-w-8 data-[disabled=true]:bg-transparent" data-disabled={!dark}>DARK</div>
            <div className="px-1 flex-1 bg-white text-button min-w-8 data-[disabled=true]:bg-opacity-0" data-disabled={dark}>LIGHT</div>
          </div>
        </Button>
      </Block>
    </Window>
  )
}

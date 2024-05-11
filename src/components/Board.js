import { useState, useRef, useEffect } from "react";
import { ColRow } from "../utils/ColRow";
import { GamePlay } from "../utils/GamePlay";

function Item({ char, selected }) {
  const isEmpty = char == " ";
  const isOn = !isEmpty && char == char.toUpperCase();

  return (<div className="text-[24px] aspect-square uppercase flex justify-center items-center 
    border-8 border-gray-100 bg-gray-100
  data-[state=on]:border-gray-600 data-[state=on]:text-gray-600
  data-[state=off]:border-gray-400 data-[state=off]:text-gray-400
  transition-all
  data-[selected=true]:duration-0
  data-[char=T]:bg-pink-200
  data-[char=O]:bg-violet-200
  data-[char=R]:bg-amber-200
  data-[char=A]:bg-cyan-200
  data-[char=D]:bg-lime-200
  data-[char=M]:bg-lime-200
  data-[state=on]:data-[selected=true]:bg-gray-600
  data-[state=on]:data-[selected=true]:text-gray-50
  data-[state=off]:data-[selected=true]:bg-gray-400
  data-[state=off]:data-[selected=true]:text-gray-600
  "
    data-state={isOn ? "on" : isEmpty ? "" : "off"}
    data-selected={selected}
    data-char={char}
  >
    {char}
  </div>
  );
}

//////////////////////////////////////////////////////////////////////////////


export function Board({ chars, word, onSwap, onSelect }) {
  const fieldRef = useRef(null);
  const [selection, setSelection] = useState([]);

  useEffect(() => {
    console.log("AAAAAA", chars);
  }, [chars.toUpperCase()]);

  function posFromEvent(e) {
    const w = fieldRef.current.offsetWidth;
    const x = e.pageX - fieldRef.current.offsetLeft;
    const y = e.pageY - fieldRef.current.offsetTop;
    const size = w / 5;
    const col = Math.floor(x / size);
    const row = Math.floor(y / size);
    return { col, row };
  }

  function IsSelected(index) {
    for (let pos of selection) {
      if (ColRow.isSame(pos, ColRow.fromIndex(index))) {
        return true;
      }
    }
    return false;
  }
  useEffect(() => {
    fieldRef.current.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }, [])

  function handleMouseMove(e) {
    if (e.buttons === 0 && !e.touches) return;
    const pos = posFromEvent(e.touches ? e.touches[0] : e);
    const newSelection = GamePlay.touchAt(pos, chars, selection);
    setSelection(newSelection);
    onSelect(newSelection);
    return false;
  }

  function handleMouseUp() {
    const newChars = GamePlay.untouch(chars, word, selection);
    setSelection([]);
    onSelect([]);
    if (newChars !== chars) onSwap(newChars);
  }

  return (
    <div
      ref={fieldRef}
      className="aspect-square select-none bg-white grid grid-cols-5 gap-2 p-2"
      onMouseDown={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      {chars.split("").map((char, index) =>
        <Item char={char} key={index} selected={IsSelected(index)} />)}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { ColRow } from "../utils/ColRow";
import { GamePlay } from "../utils/GamePlay";
import { IconUndo } from "./Ui";

export function Item({ char, index, selected, selectionTo, ...props }) {
  const isEmpty = char == " ";
  const isOn = !isEmpty && char == char.toUpperCase();

  return (<div {...props} className="text-[24px] aspect-square uppercase flex justify-center items-center 
    border-8 border-gray-100 bg-gray-100
  data-[state=on]:border-gray-600 data-[state=on]:text-gray-600

  data-[char=c3]:bg-pink-200
  data-[char=c4]:bg-violet-200
  data-[char=c0]:bg-amber-200
  data-[char=c1]:bg-cyan-200
  data-[char=c2]:bg-lime-200
  data-[char=c5]:bg-red-200

  data-[char=c3]:rounded-ss-[12px]
  data-[char=c2]:rounded-ee-[12px]
  data-[char=c1]:rounded-se-[12px]
  data-[char=c0]:rounded-es-[12px]

  data-[state=off]:border-gray-400 data-[state=off]:text-gray-400
  data-[state=off]:bg-gray-100
  data-[state=on]:data-[selected=true]:bg-gray-600
  data-[state=on]:data-[selected=true]:text-gray-50
  data-[state=off]:data-[selected=true]:bg-gray-400
  data-[state=off]:data-[selected=true]:text-gray-600
  "
    data-state={isOn ? "on" : isEmpty ? "" : "off"}
    data-selected={selected}
    data-char={"c" + index}
  >

    <div className="w-0 h-0 flex justify-center items-center">{char}</div>
    {!isEmpty && selectionTo && selectionTo !== "none" &&
      <div className="w-[60px] mx-[-30px] h-0 flex justify-center items-center 
        data-[selection=bottom]:rotate-90 data-[selection=bottom]:translate-y-[34px]
        data-[selection=top]:-rotate-90 data-[selection=top]:translate-y-[-34px]
        data-[selection=right]:rotate-0 data-[selection=right]:translate-x-[34px]
        data-[selection=left]:rotate-180 data-[selection=left]:translate-x-[-34px]
        "
        data-selection={selectionTo}>
        <IconArrowRight />
      </div>
    }
  </div >
  );
}
function IconArrowRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      height="50px"
      width="50px"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >

      <path strokeWidth="3" stroke="rgb(0 0 0/0.1)" d="M4 8 L 12 8 l-2 2 m2 -2 l-2 -2" />
      <path strokeWidth="1.5" stroke="white" d="M4 8 L 12 8 l-2 2 m2 -2 l-2 -2" />
    </svg>
  );
}

export function Board({ chars, selection, onSelecting, onSelectEnd, readonly }) {
  const fieldRef = useRef(null);

  const [charClass, setCharClass] = useState({ "A": 0, "M": 1 });
  useEffect(() => {
    let letters = {};
    let count = 0;
    for (let i = 0; i < chars.length; i++) {
      const key = chars.charAt(i).toUpperCase();
      if (key != " " && !letters.hasOwnProperty(key)) {
        letters[key] = count;
        count++;
      }
      setCharClass(letters); //{"A": 0, "M": 1} etc

    }
    console.log(letters, letters["A"]);
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
  function SelectionTo(index) {
    let selectionTo = null;
    const pos = ColRow.fromIndex(index);

    for (let i = 0; i < selection.length; i++) {
      if (ColRow.isSame(pos, selection[i])) {
        selectionTo = "none";
        if (i < selection.length - 1) {
          const dir = ColRow.minus(selection[i + 1], selection[i]);
          selectionTo = ColRow.direction(dir);
        }
        break;
      }
    }
    return selectionTo;
  }
  useEffect(() => {
    fieldRef.current.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }, [])

  function handleMouseMove(e) {
    if (readonly) return;
    if (e.buttons === 0 && !e.touches) return;
    const pos = posFromEvent(e.touches ? e.touches[0] : e);
    onSelecting(pos);
  }

  function handleMouseUp() {
    if (readonly) return;
    onSelectEnd();
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
        <Item char={char} key={index} index={charClass[char.toUpperCase()]}
          selected={IsSelected(index)} selectionTo={SelectionTo(index)} />)}
    </div>
  );
}

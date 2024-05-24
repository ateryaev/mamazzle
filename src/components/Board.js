import { useState, useRef, useEffect, Fragment } from "react";
import { ColRow } from "../utils/ColRow";
import { IconArrowRight, IconAsterisk } from "./Icons";

export function Item({ char, index, selected, selectionTo, readonly, ...props }) {
  const isEmpty = char == " ";
  const isOn = !isEmpty && char == char.toUpperCase();
  const [counter, setCounter] = useState(0);
  const [style, setStyle] = useState({});

  useEffect(() => {
    if ((!readonly || isEmpty)) {
      setStyle({});
      return;
    }
    let tmo = setTimeout(() => {
      const x = (Math.random() * 4 - 2);
      const y = (Math.random() * 4 - 2);
      const a = (Math.random() * 4 - 2);
      const o = (Math.random() > 0.5 ? 100 : 70);
      let newStyle = { ...style };//{translate:`${x}px ${y}px`, }
      if (counter % 2 === 10) newStyle = { ...newStyle, rotate: `${a}deg` }
      if (counter % 2 === 10) newStyle = { ...newStyle, translate: `${x}px ${y}px` }
      //newStyle = { ...newStyle, opacity: `${o}%` }
      newStyle = {}
      if (Math.random() > 0.9) {
        newStyle = { filter: "brightness(1.5)" }
      } else {
        newStyle = { rotate: `${a}deg`, translate: `${x}px ${y}px` }
      }
      setStyle(newStyle);

      setCounter(counter + 1);
    }, Math.random() * 1000 + 500)
    return () => clearTimeout(tmo);
  }, [readonly, counter]);

  return (<div {...props} style={style} className="text-[24px] aspect-square uppercase flex 
    justify-center items-center border-8 border-gray-100 bg-gray-100
  data-[state=on]:border-gray-600 data-[state=on]:text-gray-600
  data-[char=c3]:bg-pink-200
  data-[char=c4]:bg-violet-200
  data-[char=c0]:bg-amber-200
  data-[char=c1]:bg-cyan-200
  data-[char=c2]:bg-lime-200
  data-[char=c5]:bg-red-200
  tr transition-transform duration-1000

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
  data-[readonly=true]:opacity-100
  "
    data-state={isOn ? "on" : isEmpty ? "" : "off"}
    data-selected={selected}
    data-readonly={readonly}
    data-char={"c" + index}>

    <div className="w-0 h-0 flex justify-center items-center">
      {char}
    </div>
    {!isEmpty && selectionTo && selectionTo !== "none" &&
      <div className="w-[60px] mx-[-30px] h-0 flex justify-center items-center z-10 saturate-50
        data-[selection=bottom]:rotate-90 data-[selection=bottom]:translate-y-[34px]
        data-[selection=top]:-rotate-90 data-[selection=top]:translate-y-[-34px]
        data-[selection=right]:rotate-0 data-[selection=right]:translate-x-[34px]
        data-[selection=left]:rotate-180 data-[selection=left]:translate-x-[-34px]
        "
        data-selection={selectionTo}>
        <IconArrowRight />
      </div>}
  </div>
  );
}

export function ItemLocked({ char, index, selected, selectionTo, readonly, ...props }) {
  const isEmpty = char == " ";
  const isOn = true;

  return (<div {...props} className="text-[24px] aspect-square uppercase flex 
  justify-center items-center border-[6px] border-gray-600 text-gray-600
  
  
  data-[char=c0]:bg-amber-300
  data-[char=c1]:bg-cyan-300
  data-[char=c2]:bg-lime-300
  data-[char=c3]:bg-pink-300
  data-[char=c4]:bg-violet-300
  data-[char=c5]:bg-red-300

  data-[selected=true]:bg-gray-600
  data-[selected=true]:text-cyan-300
  
  data-[char=c0]:data-[selected=true]:border-amber-300
  data-[char=c1]:data-[selected=true]:border-cyan-300
  data-[char=c2]:data-[selected=true]:border-lime-300
  data-[char=c3]:data-[selected=true]:border-pink-300
  data-[char=c4]:data-[selected=true]:border-violet-300
  data-[char=c5]:data-[selected=true]:border-red-300

  data-[char=c0]:data-[selected=true]:text-amber-300
  data-[char=c1]:data-[selected=true]:text-cyan-300
  data-[char=c2]:data-[selected=true]:text-lime-300
  data-[char=c3]:data-[selected=true]:text-pink-300
  data-[char=c4]:data-[selected=true]:text-violet-300
  data-[char=c5]:data-[selected=true]:text-red-300
  "
    data-selected={selected}
    data-char={"c" + index}>

    <div className="w-0 h-0 flex justify-center items-center border-inherit">
      <div className="w-10 h-10 border-dotted border-4  border-inherit"
        data-selected={selected}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
    </div>
    <div className="w-0 h-0 flex justify-center rotate-6 items-center">
      {char}
    </div>
    {!isEmpty && selectionTo && selectionTo !== "none" &&
      <div className="w-[60px] mx-[-30px] h-0 flex justify-center items-center 
        data-[selection=bottom]:rotate-90 data-[selection=bottom]:translate-y-[34px]
        data-[selection=top]:-rotate-90 data-[selection=top]:translate-y-[-34px]
        data-[selection=right]:rotate-0 data-[selection=right]:translate-x-[34px]
        data-[selection=left]:rotate-180 data-[selection=left]:translate-x-[-34px]
        "
        data-selection={selectionTo}>
        <IconArrowRight />
      </div>}
  </div>
  );
}

export function ItemAny({ char, selected, selectionTo, type, readonly, ...props }) {
  const isEmpty = char === " ";
  const isOn = (char === char.toUpperCase());

  return (<div {...props} className="text-[24px] aspect-square uppercase flex 
    justify-center items-center border-[6px] border-gray-100 bg-gray-100
  data-[state=on]:border-gray-600 data-[state=on]:text-gray-600

  data-[char=c3]:bg-pink-200
  data-[char=c4]:bg-violet-200
  data-[char=c0]:bg-amber-200
  data-[char=c1]:bg-cyan-200
  data-[char=c2]:bg-lime-200
  data-[char=c5]:bg-red-200
  rounded-[12px]
  
  data-[state=off]:border-gray-400 data-[state=off]:text-gray-400
  data-[state=off]:bg-gray-100
  data-[state=off]:bg-none
  data-[state=on]:data-[selected=true]:bg-gray-600
  data-[state=on]:data-[selected=true]:text-gray-50
  data-[state=off]:data-[selected=true]:bg-gray-400
  data-[state=off]:data-[selected=true]:text-gray-600
  rainbow
  data-[state=on]:data-[selected=true]:bg-none
  "
    data-state={isOn ? "on" : isEmpty ? "" : "off"}
    data-selected={selected}>

    <div className="w-0 h-0 flex justify-center items-center">
      <div className="w-12 h-12 flex justify-center items-center"><IconAsterisk /></div>
    </div>
    {!isEmpty && selectionTo && selectionTo !== "none" &&
      <div className="w-[60px] mx-[-30px] h-0 flex justify-center items-center 
        data-[selection=bottom]:rotate-90 data-[selection=bottom]:translate-y-[34px]
        data-[selection=top]:-rotate-90 data-[selection=top]:translate-y-[-34px]
        data-[selection=right]:rotate-0 data-[selection=right]:translate-x-[34px]
        data-[selection=left]:rotate-180 data-[selection=left]:translate-x-[-34px]
        "
        data-selection={selectionTo}>
        <IconArrowRight />
      </div>}
  </div>
  );
}



export function Board({ chars, mods, selection, onSelecting, onSelectEnd, readonly, solved }) {
  const fieldRef = useRef(null);

  const [charClass, setCharClass] = useState({}); //e.g. {"A": 0, "M": 1}
  useEffect(() => {
    console.log("BOARD", chars, mods);
    let letters = {};
    let count = 0;
    for (let i = 0; i < chars.length; i++) {
      const key = chars.charAt(i).toUpperCase();
      if (key != " " && !letters.hasOwnProperty(key)) {
        letters[key] = count;
        count++;
      }
      setCharClass(letters);
    }
  }, []);

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
    let { pageX, pageY } = e.touches ? e.touches[0] : e;
    pageX += fieldRef.current.parentElement.scrollLeft;
    pageY += fieldRef.current.parentElement.scrollTop;
    const pos = ColRow.fromEvent({ pageX, pageY }, fieldRef.current);
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
        <Fragment key={index}>
          {((mods.charAt(index) !== "*" && mods.charAt(index) !== "#") || char === " ") && <Item char={char} readonly={solved} index={charClass[char.toUpperCase()]}
            selected={IsSelected(index)} selectionTo={SelectionTo(index)} />}
          {mods.charAt(index) === "*" && char !== " " && <ItemAny readonly={solved} char={char}
            selected={IsSelected(index)} selectionTo={SelectionTo(index)} />}
          {mods.charAt(index) === "#" && char !== " " && <ItemLocked readonly={solved} char={char}
            selected={IsSelected(index)} selectionTo={SelectionTo(index)} index={charClass[char.toUpperCase()]} />}

        </Fragment>)}
    </div>
  );
}

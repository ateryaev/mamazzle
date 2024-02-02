import { useEffect, useRef, useState } from "react";
import { GameField } from "./utils/gamefield"

const COLS = 6;
const ROWS = 6;

const DIR = {
  R: { dc: 1, dr: 0 },
  L: { dc: -1, dr: 0 },
  U: { dc: 0, dr: -1 },
  D: { dc: 0, dr: 1 },
}

let GF = new GameField();
function Spacer({ item }) {
  return (<></>);
}
function Letter({ item, letter, on }) {
  //selection = [DIR.R]; //not selected if null
  let className = "letter on"
  return (
    //className="xbg-gray-200 rounded-full p-2 w-full flex items-center justify-center aspect-square text-xl uppercase "
    <div className={className}>
      {letter}
    </div>
  )
}

function App() {

  const [items, setItems] = useState([]);
  const [puzzleWord, setPuzzleWord] = useState("none");
  const [selectedWord, setSelectedWord] = useState("");
  const [solved, setSolved] = useState("");

  function resetItems() {
    let newItems = [];
    //const selection = GF.GetSelection();
    for (let i = 0; i < ROWS * COLS; i++) {
      const pos = idxToPos(i);
      let item = {};
      item.char = GF.CharAt(pos);
      item.on = GF.IsOnAt(pos);
      item.selected = GF.IsSelected(pos);
      newItems.push(item);
    }
    setItems(newItems);
    setPuzzleWord(GF.PuzzleWord());
    setSelectedWord(GF.SelectedWord());
    setSolved(GF.IsSolved());
  }

  useEffect(() => {
    resetItems();
  }, []);



  const fieldRef = useRef(null);
  //useEffect(() => { document.title = "Clipboards Console" }, []);

  function xy2rc(x, y, size) {
    return [Math.floor(y / size), Math.floor(x / size)]
  }

  function idxToPos(idx) {
    return { row: Math.floor(idx / COLS), col: idx % COLS };
  }
  //let touching = false;

  function handleTouchStart(e) {
    handleTouchMove(e);
  }

  function handleTouchMove(e) {
    if (e.buttons === 0) return;
    const x = e.pageX - fieldRef.current.offsetLeft;
    const y = e.pageY - fieldRef.current.offsetTop;
    const size = fieldRef.current.offsetWidth / COLS;
    GF.TouchAt(...xy2rc(x, y, size));
    resetItems();
  }
  function handleTouchEnd() {
    //console.log("TOUCH END")
    GF.TouchEnd();
    resetItems();
    //touching = false;
  }

  return (
    <div className="App p-2">
      <div>PuzzleWord: {puzzleWord}</div>
      <div>SelectedWord: {selectedWord}</div>
      <div>Solved: {solved ? "YES" : "NO"}</div>
      <div className="field gxrid-cols-6 select-none"
        ref={fieldRef}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}>

        {items.map((item, idx) => (
          <div key={idx} className={`
          ${item.char} 
          ${item.on && "on" || ""} 
          ${item.selected && "selected" || ""}`}>
            {item.char}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

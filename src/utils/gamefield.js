const COLS = 6;
const ROWS = 6;

// export const DIR = {
//   R: { dc: 1, dr: 0 },
//   L: { dc: -1, dr: 0 },
//   U: { dc: 0, dr: -1 },
//   D: { dc: 0, dr: 1 },
// }

const DIR = [
  { dc: 1, dr: 0 },
  { dc: -1, dr: 0 },
  { dc: 0, dr: -1 },
  { dc: 0, dr: 1 }
]

function Item(char, on) {
  if (!char || char === " ") char = " ";
  this.char = char;
  this.on = on;
  this.isEmpty = function () { return this.char === null; }
}

function SamePos(pos1, pos2) {
  return pos1.col === pos2.col && pos1.row === pos2.row;
}



export const GameField = function () {
  const word = "bamboo";//letter//bamboo//address//array//boom
  const field =
    "      " +
    "      " +
    "      " +
    "      " +
    "      " +
    "      ";

  let items = [];

  field.split("").forEach((val) => {
    let item = new Item(val.toUpperCase(), val.toUpperCase() === val);
    items.push(item);
  })

  //this.Items = () => items;
  let selection = [];

  this.GetSelection = () => {
    return selection.slice(0);
  }

  function ItemAt({ row, col }) {
    return items[COLS * row + col];
  }


  function AddWord(w) {
    w = w.toUpperCase();

    let positions = [];

    function InBounds(pos) {
      return pos.row > 0 && pos.row < ROWS && pos.col > 0 && pos.col < COLS;
    }
    function IsUsed(pos) {
      //console.log("IsUsed", pos);
      return positions.find((p) => SamePos(p, pos));
    }

    function RndPos(all) {
      if (all.length === 0) return null;
      return all[Math.floor(Math.random() * all.length)];
    }
    function AllStartPosition(char) {
      let starts = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (ItemAt({ row, col }).char === " " || ItemAt({ row, col }).char === char) {
            starts.push({ row, col });
          }
        }
      }
      return starts;
    }

    function AllNextPositions(char) {
      let nexts = [];
      const lastPos = positions.at(-1);
      for (let dir of DIR) {
        let nextPos = { ...lastPos }
        nextPos.row += dir.dr;
        nextPos.col += dir.dc;

        if (!InBounds(nextPos)) continue;
        if (IsUsed(nextPos)) continue;
        if (ItemAt(nextPos).char === " " || ItemAt(nextPos).char === char) {
          nexts.push(nextPos);
        }
      }
      console.log("NEXTS", ...positions, ">>>>", ...nexts);
      return nexts;

    }
    const allStarts = AllStartPosition(w.charAt(0));
    if (allStarts.length === 0) return false;
    positions.push(RndPos(allStarts));
    console.log("START", ...positions);

    for (let i = 1; i < w.length; i++) {
      //posibilities
      const allNexts = AllNextPositions(w.charAt(i));
      if (allNexts.length === 0) return false;
      positions.push(RndPos(allNexts));
    }

    console.log(...positions);

    positions.forEach((pos, i) => {
      let item = ItemAt(pos);
      if (item.char === " ") {
        item.char = w.charAt(i);
        item.on = false;
      } else {
        item.on = !item.on;
      }
    });
  }
  for (let i = 0; i < 10; i++) {
    AddWord(word);
  }


  this.CharAt = (pos) => {
    //console.log(pos)
    return ItemAt(pos).char;
  }

  this.IsOnAt = (pos) => {
    return ItemAt(pos).on;
  }

  this.IsEmptyAt = (pos) => {
    return ItemAt(pos).char === " ";
  }

  // let listner = () => { };
  // this.SetListner = (gameListner) => {
  //   listner = gameListner;
  // }

  this.TouchAt = (row, col) => {

    if (selection.length === 0) {
      if (!this.IsEmptyAt({ row, col })) selection.push({ row, col });
      //console.log("touchAt", row, col, selection);
      return;
    }

    for (let i = 0; i < selection.length; i++) {
      if (selection[i].col === col && selection[i].row === row) {
        selection = selection.slice(0, i + 1);
        //console.log("touchAt", row, col, selection);
        return;
      }
    }

    const last = selection.at(-1);
    const drow = row - last.row;
    const dcol = col - last.col;

    if (Math.abs(drow) + Math.abs(dcol) === 1) {
      if (!this.IsEmptyAt({ row, col })) selection.push({ row, col });
      return;
    }

    //console.log("ABS", Math.abs(drow), Math.abs(dcol), selection);
    const nextByRow = { row: last.row + drow / Math.abs(drow), col: last.col };
    const nextByCol = { row: last.row, col: last.col + dcol / Math.abs(dcol) };

    if (Math.abs(drow) > Math.abs(dcol) && !this.IsEmptyAt(nextByRow)) {
      this.TouchAt(nextByRow.row, nextByRow.col);
    } else if (Math.abs(dcol) > 0 && !this.IsEmptyAt(nextByCol)) {
      this.TouchAt(nextByCol.row, nextByCol.col);
    } else if (Math.abs(drow) > 0 && !this.IsEmptyAt(nextByRow)) {
      this.TouchAt(nextByRow.row, nextByRow.col);
    } else {
      return;
    }
    this.TouchAt(row, col);

    //console.log("touchAt", row, col, selection);
    //return selectionWasChanged;
  }

  this.SelectedWord = () => {
    let selectedWord = "";
    for (let pos of selection) {
      selectedWord += this.CharAt(pos);
    }
    return selectedWord;
  }

  this.PuzzleWord = () => {
    return word;
  }

  this.IsSolved = () => {
    const notSolved = items.find((p) => !p.on);
    return !notSolved;
  }

  this.IsSelected = (pos) => {
    return selection.find((p) => p.col === pos.col && p.row === pos.row);
  }

  this.TouchEnd = () => {

    let selectedWord = this.SelectedWord();

    console.log(selectedWord);
    if (selectedWord.toUpperCase() === word.toUpperCase()) {
      for (let pos of selection) {
        ItemAt(pos).on = !ItemAt(pos).on;
        //selectedWord += this.CharAt(pos);
      }
    }

    selection = [];
    //check the selected word is correct and reverse item status
    //or just cancel current selection
    //return switchedOrNot;
  }
}


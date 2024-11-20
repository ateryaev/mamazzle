import { Fragment, useMemo } from "react";
import { Block, BlockTitle } from "./Ui"
import { IconAsterisk } from "./Icons";

function InvalidChar({ char }) {
  return (
    <div className="aspect-square rounded-sm text-gray-50 w-[30px] flex justify-center items-center bg-red-600
    r rotate-3">
      {char}
    </div>
  )
}
function GoodChar({ char }) {
  return (
    <div className="aspect-square text-gray-50 w-[30px] flex justify-center items-center bg-gray-800
    rounded-sm">
      {char === "*" ? <IconAsterisk /> : char}
    </div>
  )
}
function QuestionChar() {
  return (
    <div className="aspect-square rounded-sm w-[30px] flex justify-center items-center bg-gray-50 text-gray-200">
      ?
    </div>
  )
}
export function Selection({ selected, needed }) {

  const isActive = useMemo(() => selected.length > 0, [selected]);
  const selectedChars = useMemo(() => selected.toUpperCase().split(""), [selected]);
  const neededChars = useMemo(() => needed.toUpperCase().split(""), [needed]);

  function isSelectionAny(index) {
    return selectedChars[index] === "*";
  }

  function isSelectionOk(index) {
    return isSelectionAny(index) || selectedChars[index] === neededChars[index];
  }

  function isSelected(index) {
    return index < selectedChars.length;
  }

  return (
    <Block>
      <BlockTitle>
        {isActive && neededChars.map((_, index) => (
          <Fragment key={index}>
            {isSelected(index) && !isSelectionOk(index) && <InvalidChar char={selectedChars[index]} />}
            {isSelected(index) && isSelectionOk(index) && <GoodChar char={selectedChars[index]} />}
            {!isSelected(index) && <QuestionChar />}
          </Fragment>))
        }
        {!isActive && <div className="uppercase text-nowrap text-ellipsis overflow-hidden px-2">swipe over the word</div>}
      </BlockTitle>
    </Block>
  );
}
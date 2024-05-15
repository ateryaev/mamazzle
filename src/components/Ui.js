import { useEffect } from "react";



export function Title({ children, onBack }) {
  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth', });
  }
  return (
    <div onClick={handleClick}
      className="justify-between bg-accent z-10 flex gap-2 p-4 -mx-2 top-0 sticky"
    >
      {onBack && <RoundButton onClick={onBack} isDark={true}><IconArrowBack /></RoundButton>}
      <div className="text-white flex-1 justify-end flex items-center p-2 text-[24px] uppercase
      data-[main=true]:justify-center data-[main=true]:text-center py-3" data-main={!onBack}>
        {children}
      </div>
    </div>
  )
}
export function Button({ children, disabled, onClick }) {
  return (
    <button onClick={onClick}
      className="flex-1 flex  p-4 items-center
      min-h-[59px] justify-center
      text-white xxtext-opacity-90
      bg-button
      enabled:active:brightness-125
      disabled:bg-gray-100 disabled:text-gray-400 "
      disabled={disabled}>
      {children}
    </button>)
}
export function RoundButton({ disabled, children, onClick, isDark }) {
  return (
    <button disabled={disabled} onClick={onClick}
      data-dark={isDark}
      className="rounded-full  aspect-square items-center flex justify-center
      text-xl border-8 h-[59px]
      text-gray-600 border-gray-600 
      enabled:active:text-white enabled:active:bg-gray-600
      data-[dark=true]:text-white data-[dark=true]:border-white
      opacity-90
      enabled:active:data-[dark=true]:text-accent enabled:active:data-[dark=true]:bg-white
      disabled:opacity-20 disabled:saturate-0
      ">
      {children}
    </button>
  );
}

export function DotPages({ pageCount, currentPage, onClick }) {
  return (
    <div className="justify-center flex gap-2 p-2">
      {[...Array(pageCount)].map((_, index) => (
        <button className="w-2 aspect-square bg-gray-50 rounded-full
        disabled:bg-gray-600"
          key={index}
          onClick={() => onClick(index)}
          disabled={currentPage === index} />
      ))}
    </div>
  )
}

export function ProgressBar({ percent }) {

  return (
    <Block>
      <BlockTitle>
        <div className="flex-1 pb-1">
          <div className="text-gray-600 text-center">&nbsp;{Math.round(percent)}%</div>
          <div className="h-2 w-[100%] bg-gray-300">
            <div className="h-2 bg-gray-600 transition-all w-1" style={{ width: percent + "%" }}></div>
          </div>

        </div>
      </BlockTitle>
    </Block>
  )
}

export function BlockTitle({ children }) {
  return (
    <div className="bg-gray-200 text-gray-600 p-2 h-[59px] flex justify-center items-center gap-2 uppercase">
      {children}
    </div>
  )
}
export function BlockAlarm({ children }) {
  return (
    <div className="bg-gray-600 text-white p-2 h-[59px] flex justify-center items-center gap-2 uppercase">
      {children}
    </div>
  )
}
export function BlockBody({ children }) {
  return (
    <div className="text-gray-500 p-2 min-h-[59px] font-normal">
      {children}
    </div>
  )
}
export function Block({ children }) {
  return (
    <div className="justify-between flex gap-2 p-2 flex-col bg-white">
      {children}
    </div>)
}

function IconArrowBack(props) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em" {...props}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={80}
        d="M244 400L100 256l144-144M120 256h292" /></svg>
  );
}

export function IconUndo(props) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  );
}

export function IconRedo(props) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
    </svg>
  );
}

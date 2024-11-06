import { useEffect, useRef, useState } from "react";
import { beepButton, preBeepButton } from "../utils/Beep";
import { IconArrowBack, IconStar } from "./Icons";

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

export function Button({ children, disabled, onClick, special }) {
  return (
    <button onClick={() => { beepButton(); onClick() }}
      onPointerDown={() => !disabled && preBeepButton()}
      className="flex-1 flex  p-4 items-center
      min-h-[59px] justify-center w-full
      text-white
      bg-button
      data-[special=true]:bg-opacity-20 
      data-[special=true]:border-0
      data-[special=true]:text-button
      rounded-sm
      enabled:active:brightness-125
      disabled:bg-gray-100 disabled:text-gray-400"
      data-special={special}
      disabled={disabled}>
      {children}
    </button>)
}

export function RoundButton({ disabled, children, onClick, isDark }) {
  return (
    <button disabled={disabled} onClick={() => { beepButton(); onClick() }}
      onPointerDown={() => !disabled && preBeepButton()}
      data-dark={isDark}
      className="rounded-full  aspect-square items-center flex justify-center
      text-xl border-8 h-[59px]
      text-gray-600 border-gray-600 
      enabled:active:text-white enabled:active:bg-gray-600
      data-[dark=true]:text-white data-[dark=true]:border-white
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
  const period = 1;
  const [render, setRender] = useState(0);

  useEffect(() => {
    setRender(percent);
  }, []);

  useEffect(() => {
    const tmo = setTimeout(() => {
      if (Math.round(render - percent) === 0) return;
      const step = render > percent ? -1 : 1;
      setRender(render + step);
    }, period);
    return () => clearTimeout(tmo);
  }, [render, percent]);

  return (
    <BlockTitle>
      <div className="flex-1 pb-1">
        <div className="text-gray-600 text-center">&nbsp;{Math.round(render)}%</div>
        <div className="h-2 w-[100%] bg-gray-300 rounded-md overflow-hidden">
          <div className="h-2 bg-gray-600 w-1 rounded-md" style={{ width: render + "%" }}></div>
        </div>
      </div>
    </BlockTitle>
  )
}

export function BlockTitle({ children }) {
  return (
    <div className="bg-gray-200 rounded-sm text-gray-600 p-2 h-[59px] flex justify-center items-center gap-2 uppercase">
      {children}
    </div>
  )
}
export function BlockAlarm({ children }) {
  const star1 = useRef(null);
  const star2 = useRef(null);
  const star3 = useRef(null);
  const [step, setStep] = useState(0);
  const scope = useRef(null)
  //const [scope, animate] = useAnimate()


  useEffect(() => {
    const tmo = setTimeout(() => {

      const list = scope.current.querySelectorAll("svg");
      const idx = step % list.length;
      let svg = list[idx];
      const dx = Math.floor(Math.random() * 320 - 160);
      const dy = 60;
      const scale = Math.random();
      svg.style.translate = `${dx}px ${dy}px`
      svg.style.opacity = 0.5 * scale + 0.1;
      svg.style.transition = "none";
      svg.style.scale = scale + 0.5;

      setTimeout(() => {
        svg.style.opacity = 0;
        svg.style.scale = (scale + 0.5) / 2.0;
        svg.style.translate = `${dx}px ${dy - 90}px`
        svg.style.transition = `all ${scale + 1}s`;
      }, 10);
      setStep(step + 1);
      //setStep(step + 1);
    }, 200);
    return () => clearTimeout(tmo);
  }, [step])


  return (
    <div className="bg-gray-600 overflow-hidden rounded-sm text-white p-2 h-[59px] flex justify-center items-center gap-0 uppercase">
      <div className="h-0 w-0 whitespace-nowrap flex justify-center items-center">{children}</div>
      <div ref={scope} className="h-0 flex justify-center items-center">
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
        <IconStar className="m-[-25px] opacity-0 flex justify-center items-center" />
      </div>
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
    <div className="justify-between flex gap-2 p-2 flex-col bg-white scroll-m-2 rounded-md">
      {children}
    </div>)
}


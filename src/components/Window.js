import { useEffect, useRef } from "react";
import { IconArrowBack } from "./Icons";
import { RoundButton } from "./Ui";

export function Window({ children, title, onBack }) {
  const scrollDiv = useRef(null);

  useEffect(() => {
    setTimeout(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, 1);
  }, []);
  function handleTitleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-svh w-[360px] bg-gray-300">

      <div className="justify-between bg-accent flex gap-2 p-4 pt-8 sticky -top-4 -mt-4 z-10
        text-white dark:bg-gray-300 dark:text-gray-800 text-[24px] uppercase" onClick={handleTitleClick}>
        {onBack && <RoundButton onClick={onBack} isDark={true}><IconArrowBack /></RoundButton>}
        <div className="flex-1 justify-end flex items-center p-2 text-[24px] uppercase
          data-[main=true]:justify-center data-[main=true]:text-center py-3"
          data-main={!onBack}>{title}</div>
      </div>

      <div ref={scrollDiv} className="flex flex-col gap-2 p-2">
        {children}
        <div className="text-xs py-2 text-gray-500 text-center">
          Mamazzle v1.01<br />
          Anton Teryaev, 2024<br />
        </div>
      </div>
    </div>
  )
}
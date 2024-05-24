import { useEffect, useRef } from "react";
import { IconArrowBack, IconGithub } from "./Icons";
import { Button, RoundButton } from "./Ui";

export function Window({ children, title, onBack }) {
  const scrollDiv = useRef(null);

  function handleTitleClick() {
    scrollDiv.current.children[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  return (
    <div className="h-svh w-[360px] bg-gray-300 flex flex-col">

      <div className="justify-between bg-accent flex gap-2 p-4
        text-white text-[24px] uppercase" onClick={handleTitleClick}>
        {onBack && <RoundButton onClick={onBack} isDark={true}><IconArrowBack /></RoundButton>}
        <div className="flex-1 justify-end flex items-center p-2 text-[24px] uppercase
          data-[main=true]:justify-center data-[main=true]:text-center py-3"
          data-main={!onBack}>{title}</div>
      </div>

      <div ref={scrollDiv} className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
        {children}
        <div className="text-xs py-2 text-gray-500 text-center">
          Mamazzle v1.0<br />
          Anton Teryaev, 2024<br />
          <a href="https://github.com/ateryaev/mamazzle"
            className="text-2xl text-center mt-2 inline-block hover:text-gray-500" target="_blank">
            <IconGithub />
          </a>
        </div>
      </div>

    </div>

  )
}
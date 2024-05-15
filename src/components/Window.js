import { useEffect } from "react";
import { IconArrowBack, IconGithub } from "./Icons";
import { Button, RoundButton } from "./Ui";

export function Window({ children, title, onBack }) {
  useEffect(() => {

    window.scrollTo(0, 0);
    console.log("WINDOW");

  }, []);
  return (

    <div className="shadow-md h-svh w-[360px] bg-gray-300 xxoverflow-y-auto
    flex flex-col">
      <div className="justify-between bg-accent flex gap-2 p-4 top-0 sticky 
        text-white text-[24px] uppercase">
        {onBack && <RoundButton onClick={onBack} isDark={true}><IconArrowBack /></RoundButton>}
        <div className="flex-1 justify-end flex items-center p-2 text-[24px] uppercase
          data-[main=true]:justify-center data-[main=true]:text-center py-3"
          data-main={!onBack}>{title}</div>
      </div>

      <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
        {children}

        <div className="text-xs py-2 text-gray-500 text-center">
          Mamazzle v1.0<br />
          Anton Teryaev, 2024<br />
          <a href="https://github.com/ateryaev/mamazzle"
            className="text-2xl text-center mt-2 inline-block hover:text-gray-500" target="_blank">
            <IconGithub />
          </a>

          {/* <div className="flex flex-col gap-1 p-2">
            <Button onClick={() => forceSolve("mama", 15)}>solve 15 mama</Button>
            <Button onClick={() => forceSolve("radar", 31)}> solve 31 radar</Button>
            <Button onClick={() => forceSolve("cocoa", 48)}> solve 48 cocoa</Button>
          </div> */}
        </div >
      </div>

    </div >

  )
}
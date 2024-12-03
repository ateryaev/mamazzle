import { useEffect, useRef } from "react";
import { IconArrowBack, IconGithub } from "./Icons";
import { RoundButton } from "./Ui";
import { PLAYGAMES_STATE, usePlayGames } from "./PlayGamesContext";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

export function Window({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollDiv = useRef(null);
  const { state } = usePlayGames();
  useEffect(() => {
    setTimeout(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, 1);
  }, []);

  function handleTitleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    document.startViewTransition(() => {
      flushSync(() => {
        navigate(-1);
      });
    });
  }

  return (
    <div className="min-h-svh w-[360px] bg-gray-300">

      <div className="justify-between bg-accent flex gap-2 p-4 pt-8 sticky -top-4 -mt-4 z-10
        text-white dark:bg-gray-300 dark:text-gray-800 text-[24px] uppercase" onClick={handleTitleClick}>
        {location.pathname.length > 1 && <RoundButton onClick={handleBack} isDark={true}><IconArrowBack /></RoundButton>}
        <div className="flex-1 justify-end flex items-center p-2 text-[24px] uppercase
          data-[main=true]:justify-center data-[main=true]:text-center py-3"
          data-main={location.pathname.length < 2}>{title}</div>
      </div>

      <div ref={scrollDiv} className="flex flex-col gap-2 p-2">
        {children}
        <div className="text-xs py-2 text-gray-500 text-center">
          Mamazzle {state === PLAYGAMES_STATE.DISABLED ? "v1.01" : "v1.1"}<br />
          Anton Teryaev, 2024<br />
          {(false) && (<a href="https://github.com/ateryaev/mamazzle"
            className="text-sm text-center mt-1 inline-block hover:text-gray-700" target="_blank">
            <IconGithub />
          </a>)}
        </div>
      </div>
    </div>
  )
}
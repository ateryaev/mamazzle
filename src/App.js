import { PageLevels } from "./PageLevels"
import { PageMain } from "./PageMain"
import { PagePlay } from "./PagePlay"
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSettings } from "./utils/GameData";
import { usePlayGames } from "./components/PlayGamesContext";

export default function App() {
  const { score } = usePlayGames();
  const location = useLocation();
  useEffect(() => {
    window.changeTheme(getSettings().dark)
  }, []);

  return (
    <Routes location={location} key={location.pathname + ":" + score}>
      <Route exact path="/" element=<PageMain /> />
      <Route path="/play/:word" element=<PageLevels /> />
      <Route path="/play/:word/:lvl" element=<PagePlay /> />
    </Routes>
  );
}

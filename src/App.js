import { PageLevels } from "./PageLevels"
import { PageMain } from "./PageMain"
import { PagePlay } from "./PagePlay"
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { getSettings } from "./utils/GameData";

export default function App() {
  const location = useLocation();
  useEffect(() => {
    window.changeTheme(getSettings().dark)
  }, []);

  return (
    <Routes location={location} key={location.pathname}>
      <Route exact path="/" element=<PageMain /> />
      <Route path="/play/:word" element=<PageLevels /> />
      <Route path="/play/:word/:lvl" element=<PagePlay /> />
    </Routes>
  );
}

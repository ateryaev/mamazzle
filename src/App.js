import { createContext, useContext, useEffect, useRef, useState, forceUpdate } from "react";
import { PageLevels } from "./PageLevels"
import { PageMain } from "./PageMain"
import { PagePlay } from "./PagePlay"
import { AnimatePresence } from "framer-motion";

import { BrowserRouter, Route, Routes, useLocation, useParams } from "react-router-dom";
import { Button, Title } from "./components/Ui";
import { SaveLevelsSolved } from "./utils/GameData";
import { Ctx } from "./Ctx";



function App() {

  const location = useLocation();
  const [ctxCounter, setCtxCounter] = useState(0);

  const ctx = useContext(Ctx);
  function forceSolve(word, count) {
    SaveLevelsSolved(word, count);
    this.forceUpdate();
  }
  return (
    <Ctx.Provider value={ctx}>
      <Routes location={location} key={location.pathname}>
        <Route exact path="/" element=<PageMain /> />
        <Route path="/play/:word" element=<PageLevels /> />
        <Route path="/play/:word/:lvl" element=<PagePlay /> />
      </Routes>
    </Ctx.Provider>
  );
}

export default App;

import { PageLevels } from "./PageLevels"
import { PageMain } from "./PageMain"
import { PagePlay } from "./PagePlay"
import { Route, Routes, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route exact path="/" element=<PageMain /> />
      <Route path="/play/:word" element=<PageLevels /> />
      <Route path="/play/:word/:lvl" element=<PagePlay /> />
    </Routes>
  );
}

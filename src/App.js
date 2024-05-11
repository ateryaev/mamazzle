import { useEffect, useRef, useState } from "react";
import { PageLevels } from "./PageLevels"
import { PageMain } from "./PageMain"
import { PagePlay } from "./PagePlay"
import { useParams, useNavigate } from "react-router-dom";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  const params = useParams();

  return (
    <div className="flex justify-center">
      <Router>
        <Routes>
          <Route exact path="/" element=<PageMain /> />
          <Route path="/play/:word" element=<PageLevels /> />
          <Route path="/play/:word/:lvl" element=<PagePlay /> />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

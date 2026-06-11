import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { StatsPage } from "./pages/StatsPage";
import { VotePage } from "./pages/VotePage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <span className="nav__brand">Exhibit Vote</span>
          <div className="nav__links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
              end
            >
              Vote
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              Stats
            </NavLink>
          </div>
        </nav>

        <main className="app__main">
          <Routes>
            <Route path="/" element={<VotePage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

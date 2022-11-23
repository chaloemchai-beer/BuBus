import MapView from "./pages/MapView";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import MainPage from "./pages/MainPage";
import Search from "./pages/Search";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<MainPage />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<MapView />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

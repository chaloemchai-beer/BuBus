import MapView from "./pages/MapView";
import "./styles/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

import MapView from "./pages/MapView";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="*" element={<MapView />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

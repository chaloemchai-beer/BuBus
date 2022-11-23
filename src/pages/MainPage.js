import React from "react";
import { Link } from "react-router-dom";
import "../styles/MainPage.css"

const MainPage = () => {
  return (
    <div className="mainpage">
      <Link to="/map" className="button">GO TO MAP</Link>
    </div>
  );
};

export default MainPage;

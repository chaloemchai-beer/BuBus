import React from "react";
import "../styles/Navbar.css";
import ListView from "./ListView";
import logo from "../assets/logo.png";
import "../styles/Search.css";
import bubustop from "../data/busstop.json";

const Navbar = () => {
  return (
    <>
      <ListView />
      <div className="navbar">
        <img src={logo} alt="" className="logo" />
        <div className="box">
          <select className="selectbox">
            {bubustop.map((busstop, idx) => (
              <option value={busstop.id} key={idx}>
                {busstop.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default Navbar;

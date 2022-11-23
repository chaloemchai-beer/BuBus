import React from "react";
import "../styles/Navbar.css";
import ListView from "./ListView";
import search from "../assets/search.png";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <ListView />
      <div className="navbar">
        <img src={logo} alt="" className="logo" />
        <Link to="/search">
          <img src={search} alt="" className="img_search" />
        </Link>
      </div>
    </>
  );
};

export default Navbar;

import React from "react";
import "../styles/Navbar.css";
import ListView from "./ListView";
import returnimg from "../assets/return.png";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <ListView />
      <div className="navbar">
        <img src={logo} alt="" className="logo" />
        <Link to="/map">
          <img src={returnimg} alt="" className="img_search" />
        </Link>
      </div>
    </>
  );
};

export default Navbar;

import React from "react";
import { slide as Menu } from "react-burger-menu";
import "../styles/ListView.css";
import bubustop from "../data/busstop.json";

const ListView = () => {
  return (
    <Menu>
      {bubustop.map((busstop, idx) => (
        <p className="menu-item" key={idx}>{busstop.name}</p>
      ))}
    </Menu>
  );
};

export default ListView;

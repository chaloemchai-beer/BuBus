import React from "react";
import NavbarForSearch from "../components/NavbarForSearch";
import "../styles/Search.css";
import bubustop from "../data/busstop.json";

const Search = () => {
  return (
    <div>
      <NavbarForSearch />
      <div class="box">
        <label for="html">Where are you?</label>
        <select>
          {bubustop.map((busstop, idx) => (
            <option value={busstop.id} key={idx}>{busstop.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Search;

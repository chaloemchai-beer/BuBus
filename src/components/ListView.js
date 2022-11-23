import React from "react";
import "../styles/App.css";

const ListView = () => {
  return (
    <div>
      <div className="list-view">
      <button className="btn_close">☰</button>
        <div className="list-view-brand">
          <h2 className="title is-4">COVID-19 Tracker</h2>
        </div>
        <div className="list-view-total">
          <h2 className="title is-4">Total</h2>
          Total
        </div>
        <div className="list-view-location">Total</div>
      </div>
      
    </div>
  );
};

export default ListView;

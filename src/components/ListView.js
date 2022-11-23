import React from "react";
import "../styles/App.css"

const ListView = () => {
  return (
    <div className="list-view">
      <div className="list-view-brand">
        Bus
      </div>
      <div className="list-view-total">
        <h2 className="columns">
          total
        </h2>
        <div className="columns">
          <h6 className="title is-6">Case</h6>
        </div>
      </div>
      <div className="list-view-location"></div>
      <div className="columns">
          <h6 className="title is-6">Case</h6>
        </div>
    </div>
  );
};

export default ListView;

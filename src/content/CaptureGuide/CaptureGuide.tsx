import React from "react";
import "./CaptureGuide.scss";

function CaptureGuide() {
  return (
    <>
      <div className="cg-mask"></div>
      <div className="cg-lines">
        <div className="cg-hline"></div>
        <div className="cg-vline"></div>
      </div>
    </>
  );
}

export default CaptureGuide;

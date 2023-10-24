import React from "react";
import "./CaptureGuide.scss";

function CaptureGuide() {
  return (
    <div className="capture-guide">
      <div className="mask"></div>
      <div className="guides">
        {/* 가로 및 세로 보조선 */}
        <div className="horizontal-line"></div>
        <div className="vertical-line"></div>
      </div>
    </div>
  );
}

export default CaptureGuide;

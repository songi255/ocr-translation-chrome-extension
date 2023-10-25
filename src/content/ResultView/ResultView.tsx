import React, { useEffect, useState } from "react";
import "./ResultView.scss";

interface ResultViewProps {
  setShowingResult: (isShowingResult: boolean) => void;
  result: TranslateResult;
}

function ResultView({ setShowingResult, result }: ResultViewProps) {
  function handleCloseButton() {
    setShowingResult(false);
  }

  return (
    <div className="rv-container">
      <button onClick={handleCloseButton}>close</button>
      <textarea className="rv-original-text">{result.originalText}</textarea>
      <textarea className="rv-translated-text">
        {result.translatedText}
      </textarea>
    </div>
  );
}

export default ResultView;

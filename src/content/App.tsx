import React, { useEffect, useState } from "react";
import CaptureGuide from "./CaptureGuide/CaptureGuide";
import ResultView from "./ResultView/ResultView";
import "./App.scss";

function App() {
  const [isCaptureMode, setCaptureMode] = useState(false);
  const [isShowingResult, setShowingResult] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  function messageListener(message: Message) {
    if (message.eventType === "start-capture") {
      setCaptureMode(true);
    }
    if (message.eventType === "show-result") {
      setShowingResult(true);
      const resultText = message.message;
      console.log(resultText);
    }
  }

  return (
    <>
      {isCaptureMode ? <CaptureGuide /> : null}
      {isShowingResult ? <ResultView /> : null}
    </>
  );
}

export default App;

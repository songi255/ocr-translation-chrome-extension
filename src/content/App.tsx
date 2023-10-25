import React, { useEffect, useState } from "react";
import ResultView from "./ResultView/ResultView";
import "./App.scss";
import Capture from "./Capture/Capture";

function App() {
  const [isCaptureMode, setCaptureMode] = useState(false);
  const [isShowingResult, setShowingResult] = useState(false);
  const [translateResult, setTranslateResult] = useState(null as any);

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
      setTranslateResult(message.message);
    }
  }

  return (
    <>
      {isCaptureMode ? <Capture setCaptureMode={setCaptureMode} /> : null}
      {isShowingResult ? (
        <ResultView
          setShowingResult={setShowingResult}
          result={{ ...translateResult }}
        />
      ) : null}
    </>
  );
}

export default App;

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

class Viewer {
  registerViewer() {
    this.setupReact();

    chrome.runtime.onMessage.addListener((message: Message) => {
      if (message.eventType === "show-result") {
        const resultText = message.message;
        this.view(resultText);
      }
    });
  }

  setupReact() {
    const rootId = "ocr_translation_app_root";
    if (document.getElementById(rootId)) return;

    const rootDiv = document.createElement("div");
    rootDiv.setAttribute("id", rootId);
    document.body.appendChild(rootDiv);

    const appRoot = createRoot(rootDiv);
    appRoot.render(<App />);
  }

  view(message: any) {
    console.log(message);
  }
}

const viewer = new Viewer();
export { viewer };

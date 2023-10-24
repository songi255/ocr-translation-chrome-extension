import { createRoot } from "react-dom/client";
import App from "./App";
import React from "react";

setup();

function setup() {
  const rootId = "ocr_translation_app_root";
  if (document.getElementById(rootId)) return;

  const rootDiv = document.createElement("div");
  rootDiv.setAttribute("id", rootId);
  document.body.appendChild(rootDiv);

  const appRoot = createRoot(rootDiv);
  appRoot.render(<App />);
}

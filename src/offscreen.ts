import { OcrRequest, OcrResponse } from "./service_worker";
//import { ocr } from "./scripts/ocr";
import { createWorker } from "tesseract.js";

console.log("offscreen logging test");

// async function setupOcr(){
//   await ocr.initialize().then(() => ocr.setLoadLanguage("eng"));
// }

chrome.runtime.onMessage.addListener(
  (message: OcrRequest, sender, sendResponse) => {
    // message from content.js as an capture request
    if (message.eventType === "request-ocr") {
      console.log(message.base64);

      fetch(message.base64)
        .then((base64) => base64.blob())
        .then((blob) => URL.createObjectURL(blob))
        // .then((url) => {
        //   console.log(ocr);
        //   return ocr.recognize(url);
        // })
        // .then((res) => console.log(res));
        .then(async (url) => {
          const worker = await createWorker({
            workerBlobURL: false,
            cacheMethod: "none",
            workerPath: "tesseract/worker.min.js",
            corePath: "tesseract/tesseract-core.wasm.js",
            langPath: "https://tessdata.projectnaptha.com/4.0.0",
            logger: (m) => console.log(m),
            errorHandler: (e) => console.warn(e),
          });

          await worker.loadLanguage("eng");
          await worker.initialize("eng");

          const result = await worker.recognize(url);
          console.log(result.data.text);

          sendResponse({
            eventType: "response-ocr",
            text: result.data.text,
          } as OcrResponse);
        });

      return true;
    }
  }
);

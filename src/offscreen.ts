import { OcrRequest, OcrResponse } from "./service_worker";
import { ocr } from "./scripts/ocr";
import { translator } from "./scripts/translate";

chrome.runtime.onMessage.addListener(
  (message: OcrRequest, sender, sendResponse) => {
    // message from content.js as an capture request
    if (message.eventType === "request-ocr") {
      fetch(message.base64).then(async (base64) => {
        const blob = await base64.blob();
        const url = URL.createObjectURL(blob);

        // do ocr
        await ocr.setupWorker();
        await ocr.setupLanguage("eng");
        const result = await ocr.recognize(url);

        console.log(result.data.text);

        // do translate
        translator.requestTranslation("this is the sample text", "korean");

        // do response
        sendResponse({
          eventType: "response-ocr",
          text: result.data.text,
        } as OcrResponse);
      });

      return true;
    }
  }
);

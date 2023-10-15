import { OcrRequest, OcrResponse } from "./service_worker";
//import { ocr } from "./scripts/ocr";
import { createWorker } from "tesseract.js";
import { v4 } from "uuid";

console.log("offscreen logging test");

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

          // tocken test
          const auth = await fetch(
            "https://chat.openai.com/api/auth/session",
            {}
          )
            .then((r) => r.json())
            .catch(() => ({}));
          if (!auth.accessToken) {
            throw new Error("UNAUTHORIZED");
          }
          const apiKey = auth.accessToken;

          try {
            const body = {
              action: "next",
              messages: [
                {
                  id: v4(),
                  role: "user",
                  content: {
                    content_type: "text",
                    parts: ["what is the capital of Korea?"],
                  },
                },
              ],
              model: "text-davinci-002-render",
              parent_message_id: v4(),
            };

            await fetch("https://chat.openai.com/backend-api/conversation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify(body),
            }).then((res) => {
              console.log(res);
            });
          } catch (e) {
            console.error(e);
          }

          sendResponse({
            eventType: "response-ocr",
            text: result.data.text,
          } as OcrResponse);
        });

      return true;
    }
  }
);

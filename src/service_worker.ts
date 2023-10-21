import { capture, Crop } from "./scripts/capture";

// create offscreen for ocr
let creating: Promise<void> | null;
async function setupOffscreenDocument(path: string) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (!creating) {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.BLOBS],
      justification: "tesseract uses URL.createObjectUrl() method",
    });
  }
  await creating;
  creating = null;
}

// messaging codes

interface BgMessage {
  eventType: "request-operation";
  cropPos: Crop;
}

interface BgResponse {
  base64: string;
  text: string;
}

interface OcrRequest {
  eventType: "request-ocr";
  base64: string;
}

interface OcrResponse {
  eventType: "response-ocr";
  text: string;
}

/**
 *
 * handler of message from content.js or offscreen.js
 * @param sendResponse callback that provided and called from content.js for response
 */
chrome.runtime.onMessage.addListener(
  (message: BgMessage | OcrResponse, sender, sendResponse) => {
    console.log("service worker recieved message from content.js");
    console.log(message);

    // message from content.js as an capture request
    if (message.eventType === "request-operation") {
      capture.capture(message.cropPos, (croppedBlob) => {
        console.log(croppedBlob);

        // serialize blob data to base 64
        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = () => {
          const base64 = reader.result;

          // ocr. send message to offscreen page.
          setupOffscreenDocument("offscreen.html").then(() => {
            chrome.runtime.sendMessage(
              {
                eventType: "request-ocr",
                base64: base64,
              } as OcrRequest,
              (response: OcrResponse) => {
                sendResponse({
                  base64: base64,
                  text: response.text,
                } as BgResponse);
              }
            );
          });
        };
      });
      return true;
    }

    // message from offscreen.js as a response of ocr
    if (message.eventType === "response-ocr") {
      console.log(message.text);
      return true;
    }
  }
);

export { BgMessage, BgResponse, OcrRequest, OcrResponse };

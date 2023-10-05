import { capture, Crop } from "./scripts/capture";

interface BgMessage {
  eventType: "request-operation";
  cropPos: Crop;
}

interface BgResponse {
  original: "original text";
  translated: "translated text";
}

/**
 *
 * handler of message from content.js
 * @param sendResponse callback that provided and called from content.js for response
 */
chrome.runtime.onMessage.addListener(
  (message: BgMessage, sender, sendResponse) => {
    if (message.eventType === "request-operation") {
      console.log("recieved message");
      capture.capture(message.cropPos, (dataUrl) => {
        // TODO : do ocr in here.
        sendResponse({
          original: "original text",
          translated: "translated text",
        } as BgResponse);
      });
      return true;
    }
  }
);

export { BgMessage, BgResponse };

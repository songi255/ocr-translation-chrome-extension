import { capture, Crop } from "./scripts/capture";

interface BgMessage {
  eventType: "request-operation";
  cropPos: Crop;
}

interface BgResponse {
  base64: string;
}

/**
 *
 * handler of message from content.js
 * @param sendResponse callback that provided and called from content.js for response
 */
chrome.runtime.onMessage.addListener(
  (message: BgMessage, sender, sendResponse) => {
    console.log("service worker recieved message from content.js");
    console.log(message);
    if (message.eventType === "request-operation") {
      capture.capture(message.cropPos, (croppedBlob) => {
        console.log(croppedBlob);

        // serialize blob data to base 64
        const reader = new FileReader();
        reader.readAsDataURL(croppedBlob);
        reader.onloadend = () => {
          const base64 = reader.result;
          sendResponse({
            base64: base64,
          } as BgResponse);
        };
      });
      return true;
    }
  }
);

export { BgMessage, BgResponse };

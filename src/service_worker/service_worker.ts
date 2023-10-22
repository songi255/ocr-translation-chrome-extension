import { screenshot } from "./screenshot";

// context menus trigger
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ocr_translate_capture_menu",
    title: "start capture to ocr translation",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(() =>
  sendMessageToActiveTab({
    eventType: "start-capture",
    message: "",
  })
);

async function sendMessageToActiveTab(message: Message) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const result = await chrome.tabs.sendMessage(tab.id as number, message);
}

chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.eventType === "request-screenshot") {
    const cropPos = message.message;
    screenshot.screenshot(cropPos, (croppedBlob) => {
      // serialize blob data to base 64
      const reader = new FileReader();
      reader.readAsDataURL(croppedBlob);
      reader.onloadend = async () => {
        const base64 = reader.result;

        // request operation(ocr & translate) to offscreen.html
        await setupOffscreenDocument("offscreen.html");
        chrome.runtime.sendMessage({
          eventType: "request-operation",
          message: base64,
        } as Message);
      };
    });
  }

  if (message.eventType === "response-operation") {
    const result = message.message;
    sendMessageToActiveTab({
      eventType: "show-result",
      message: result,
    });
  }
});

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

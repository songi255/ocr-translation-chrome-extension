import { ocr } from "./ocr";
import { translator } from "./translate";

chrome.runtime.onMessage.addListener(async (message: Message) => {
  if (message.eventType === "request-operation") {
    const base64 = await fetch(message.message);
    const blob = await base64.blob();
    const url = URL.createObjectURL(blob);

    // do ocr
    await ocr.setupWorker();
    await ocr.setupLanguage("eng");
    const ocrResult = await ocr.recognize(url);
    const originalText = ocrResult.data.text;

    // do translate
    try {
      await translator.getAccessToken();
    } catch (e) {
      console.error("Check your chatgpt session.", e);
    }

    await translator.requestTranslation(
      originalText,
      "korean",
      (translatedText) => {
        chrome.runtime.sendMessage({
          eventType: "response-operation",
          message: {
            originalText,
            translatedText,
          } as TranslateResult,
        } as Message);
      },
      []
    );
  }
});

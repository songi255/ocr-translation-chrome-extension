import { createWorker } from "tesseract.js";

const worker = await createWorker({
  logger: (m) => console.log(m),
});

(async () => {
  console.log(worker);
  // TODO : initialize settings by local storage
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  console.log(worker);
})();

class OCR {
  // waring : always check worker is prepaired(not null).
  private worker?: Tesseract.Worker;

  async setLoadLanguage(language: string) {
    await this.worker?.loadLanguage(language);
  }

  /**
   *
   * @param url url of target image.
   * @returns Promise of {data: text} object.
   */
  recognize(url: string) {
    return this.worker?.recognize(url);
  }

  /**
   * exit worker.
   * @returns Promise of terminate result.
   */
  terminate() {
    this.worker?.terminate();
  }
}

const ocr = new OCR();
export { ocr };

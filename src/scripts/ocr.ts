import { createWorker } from "tesseract.js";

class OCR {
  // warning! worker is created asyncronousely.
  private worker?: Tesseract.Worker;

  constructor() {
    createWorker({
      logger: (m) => console.log(m),
    })
      .then(async (worker) => {
        this.worker = worker;
        // TODO : initialize settings by local storage
        await this.worker.loadLanguage("eng");
        await this.worker.initialize("eng");
      })
      .catch(() => {
        console.log("error occured in ");
      });
  }

  async setLoadLanguage(language: string) {
    await this.worker?.loadLanguage(language);
  }

  /**
   *
   * @param uri uri of target image.
   * @returns Promise of {data: text} object.
   */
  recognize(uri: string) {
    return this.worker?.recognize(uri);
  }

  /**
   * exit worker.
   * @returns Promise of terminate result.
   */
  terminate() {
    this.worker?.terminate();
  }
}

export default new OCR();

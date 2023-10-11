import { createWorker } from "tesseract.js";

class OCR {
  private worker: Promise<Tesseract.Worker>;

  constructor() {
    this.worker = createWorker({
      workerBlobURL: false,
      cacheMethod: "none",
      workerPath: "tesseract/worker.min.js",
      corePath: "tesseract/tesseract-core.wasm.js",
      langPath: "tesseract/eng.traineddata",
      logger: (m) => console.log(m),
      errorHandler: (e) => console.warn(e),
    });
    this.worker.then((worker) => {
      this.setLoadLanguage("eng");
    });
  }

  /**
   *
   * use promise chaining with initialize() to ensure that worker is prepaired.
   * @param language target language
   */
  async setLoadLanguage(language: string) {
    await this.worker.then(async (worker) => {
      await worker.loadLanguage(language);
      await worker.initialize(language);
    });
  }

  /**
   *
   * @param url url of target image.
   * @returns Promise of {data: text} object.
   */
  async recognize(url: string) {
    await this.worker.then(async (worker) => await worker.recognize(url));
  }

  /**
   * exit worker.
   * @returns Promise of terminate result.
   */
  terminate() {
    this.worker.then((worker) => worker.terminate());
  }
}

const ocr = new OCR();
export { ocr };

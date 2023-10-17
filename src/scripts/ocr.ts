import Tesseract, { createWorker } from "tesseract.js";

class OCR {
  private worker: Tesseract.Worker | undefined;
  private targetLanguage: string | undefined;
  private workerInitializing: Promise<void> | undefined;
  private languageInitializing: Promise<void> | undefined;

  /**
   *
   * This method is synchronized.
   * Worker is cached. This method ensure that only one Worker is created.
   */
  async setupWorker() {
    if (this.worker) return;
    if (this.workerInitializing) {
      await this.workerInitializing;
      return;
    }

    this.workerInitializing = (async () => {
      this.worker = await createWorker({
        workerBlobURL: false,
        cacheMethod: "none",
        workerPath: "tesseract/worker.min.js",
        corePath: "tesseract/tesseract-core.wasm.js",
        langPath: "https://tessdata.projectnaptha.com/4.0.0",
        logger: (m) => console.log(m),
        errorHandler: (e) => console.error(e),
      });
    })();
    await this.workerInitializing;

    this.workerInitializing = undefined;
  }

  /**
   *
   * setupWorker before call this method or you might get an Error.
   * @param language translation target language.
   */
  async setupLanguage(targetLanguage: string) {
    if (targetLanguage == this.targetLanguage) return;
    if (!this.worker) throw Error("Worker is not initilaized.");
    if (this.languageInitializing) {
      await this.languageInitializing;
      return;
    }

    this.languageInitializing = (async () => {
      await this.worker?.loadLanguage(targetLanguage);
      await this.worker?.initialize(targetLanguage);
      this.targetLanguage = targetLanguage;
    })();
    await this.languageInitializing;

    this.languageInitializing = undefined;
  }

  /**
   *
   * @param url url of target image.
   * @returns Promise of {data: text} object.
   */
  async recognize(url: string) {
    if (!this.worker) throw Error("Worker is not initilaized.");

    const result = await this.worker.recognize(url);
    return result;
  }

  /**
   * exit worker.
   * @returns Promise of terminate result.
   */
  async terminate() {
    if (!this.worker) return;

    const result = await this.worker.terminate();
    return result;
  }
}

const ocr = new OCR();
export { ocr };

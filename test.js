import { createWorker } from "tesseract.js";

const worker = await createWorker({
  logger: (m) => console.log(m),
});

(async () => {
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize("test2.jpg");
  console.log(text);
  await worker.terminate();
})();

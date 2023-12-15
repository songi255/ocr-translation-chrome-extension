# ocr-translation chrome extension

This project was originally an extension that OCR'd screenshots and translated the results using GPT.

**This Project is halted. Here's why:**

- `tesseract.js` ocr can't handle sentences with mixed language like "나는 더 많은 energy가 필요합니다."
- There's so many good extensions for screenshot, ocr, gpt assistant. This project seems to have become somewhat of a muddle.
- The way using GPT session auth is a little unstable.

**But you can see the points:**

- How to use `tesseract.js` on service worker context.
  - Notice that essential files of `tesseract.js` are copied from `node_modules` at the `webpack.config.js`. In this way, you can easily upgrade dependency of it.
- How to handle blob with `offscreen` api.
- How to capture images and serialize them.
- How to mix `React.js` with chrome extension.
- and so on...

**It's not finished but you can try...**

- `npm i` to install
- `npm run build` and extensions are generated at `/build` folder.

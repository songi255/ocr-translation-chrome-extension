/**
 * this class uses `chrome.tabs.captureVisibleTab()` which can only called in background.js. (can not use in content.js)
 */
class Capture {
  /**
   * capture current tab's region.
   *
   * @param (sx, sy), (ex, ey) is couple of point that defines region. Order is not important.
   * @param callback function that recieve url string of captured image.
   * @throws zero size error
   */
  capture(crop: Crop, callback: (blob: Blob) => void) {
    const ratio = crop.devicePixelRatio;
    const sx = Math.min(crop.sx, crop.ex) * ratio;
    const sy = Math.min(crop.sy, crop.ey) * ratio;
    const ex = Math.max(crop.sx, crop.ex) * ratio;
    const ey = Math.max(crop.sy, crop.ey) * ratio;
    const w = ex - sx;
    const h = ey - sy;
    if (w == 0 || h == 0) throw new Error("capture region can't be zero size.");

    chrome.tabs.captureVisibleTab({ format: "png" }, async (dataUrl) => {
      const canvas = new OffscreenCanvas(w / ratio, h / ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("can not make canvas context");

      const data = await fetch(dataUrl);
      const dataBlob = await data.blob();
      const img = await createImageBitmap(dataBlob);

      ctx.drawImage(img, sx, sy, w, h, 0, 0, w / ratio, h / ratio);
      const resultBlob = await canvas.convertToBlob();

      callback(resultBlob);
    });
  }
}

const capture = new Capture();
export { capture };

interface Crop {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  devicePixelRatio: number;
}

/**
 * this class uses `chrome.tabs.captureVisibleTab()` which can only called in background.js. (can not use in content.js)
 */
class Capture {
  /**
   * capture current tab's region.
   *
   * @param (sx, sy), (ex, ey) is couple of point that defines region. Order is not important.
   * @param callback function that recieve url string of captured image.
   */
  capture(crop: Crop, callback: (blob: Blob) => void) {
    const ratio = crop.devicePixelRatio;
    const sx = Math.min(crop.sx, crop.ex) * ratio;
    const sy = Math.min(crop.sy, crop.ey) * ratio;
    const ex = Math.max(crop.sx, crop.ex) * ratio;
    const ey = Math.max(crop.sy, crop.ey) * ratio;
    const w = ex - sx;
    const h = ey - sy;

    chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
      const canvas = new OffscreenCanvas(w / ratio, h / ratio);
      const ctx = canvas.getContext("2d");

      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => createImageBitmap(blob))
        .then((img) =>
          ctx?.drawImage(img, sx, sy, w, h, 0, 0, w / ratio, h / ratio)
        )
        .then(() => canvas.convertToBlob())
        .then((blob) => callback(blob));
    });
  }

  /**
   * save captured image to file.
   */
  saveToFile() {}
}

const capture = new Capture();
export { Crop, capture };

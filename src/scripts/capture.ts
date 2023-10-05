interface Crop {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
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
    const sx = Math.min(crop.sx, crop.ex);
    const sy = Math.min(crop.sy, crop.ey);
    const ex = Math.max(crop.sx, crop.ex);
    const ey = Math.max(crop.sy, crop.ey);
    const w = ex - sx;
    const h = ey - sy;

    chrome.tabs.captureVisibleTab({ format: "png" }, (dataUrl) => {
      const img = new Image();

      img.onload = () => {
        const canvas = new OffscreenCanvas(w, h);
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, sx, sy, w, h, 0, 0, w, h);

        canvas.convertToBlob().then((blob) => {
          callback(blob);
        });
      };
    });
  }

  /**
   * save captured image to file.
   */
  saveToFile() {}
}

const capture = new Capture();
export { Crop, capture };

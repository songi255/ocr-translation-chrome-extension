import { BgMessage, BgResponse } from "./service_worker";
import { Crop } from "./scripts/capture";

let isCaptureMode = false;
let isStartPosPicked = false;
const crop = {
  sx: 0,
  sy: 0,
  ex: 0,
  ey: 0,
  devicePixelRatio: window.devicePixelRatio,
} as Crop;

// setup `start` trigger
// FIXME : temp
document.addEventListener("mousedown", (e) => {
  if (!isCaptureMode) {
    startCapture();
  }
});

function startCapture() {
  isCaptureMode = true;
  isStartPosPicked = false;
  document.body.style.cursor = "crosshair";

  document.addEventListener("mousedown", onMouseDown);
}

function endCapture() {
  document.body.style.cursor = "auto";

  isCaptureMode = false;
  isStartPosPicked = false;

  console.log(crop);

  chrome.runtime.sendMessage(
    {
      eventType: "request-operation",
      cropPos: { ...crop },
    } as BgMessage,
    (response: BgResponse) => {
      console.log(response);
      fetch(response.base64)
        .then((base64) => base64.blob())
        .then((blob) => {
          console.log(blob);

          const img = new Image();
          const url = URL.createObjectURL(blob);
          img.src = url;
          document.querySelector("body")?.appendChild(img);
        });
    }
  );
}

// mouse event handler

function onMouseDown(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  if (!isStartPosPicked) {
    isStartPosPicked = true;
    crop.sx = e.clientX;
    crop.sy = e.clientY;
    document.addEventListener("mousemove", onMouseMove);
  } else {
    crop.ex = e.clientX;
    crop.ey = e.clientY;

    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    endCapture();
  }
}

function onMouseMove(e: MouseEvent) {
  e.stopPropagation();

  crop.ex = e.clientX;
  crop.ey = e.clientY;
}

import { BgMessage, BgResponse } from "./service_worker";
import { Crop } from "./scripts/capture";

let isCaptureMode = false;
let isStartPosPicked = false;
const crop = { sx: 0, sy: 0, ex: 0, ey: 0 } as Crop;

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
  document.body.style.cursor = "default";

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
    }
  );
}

// mouse event handler

function onMouseDown(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();

  if (!isStartPosPicked) {
    isStartPosPicked = true;
    crop.sx = e.pageX;
    crop.sy = e.pageY;
    document.addEventListener("mousemove", onMouseMove);
  } else {
    crop.ex = e.pageX;
    crop.ey = e.pageY;

    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    endCapture();
  }
}

function onMouseMove(e: MouseEvent) {
  e.stopPropagation();

  crop.ex = e.pageX;
  crop.ey = e.pageY;
}

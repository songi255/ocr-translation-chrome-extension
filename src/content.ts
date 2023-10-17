import { BgMessage, BgResponse } from "./service_worker";
import { Crop } from "./scripts/capture";
import { translator } from "./scripts/translate";

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
let leftDown = false;
let rightDown = false;

document.addEventListener("mousedown", (e) => {
  if (e.button == 2) {
    if (leftDown) {
      e.preventDefault();
      e.stopPropagation();
    }
    rightDown = true;
  }
  if (e.button == 0) leftDown = true;

  if (!(leftDown && rightDown)) return;

  if (!isCaptureMode) {
    console.log(e.button);
    if (e.button === 2) {
      startCapture();
    }
  }
});

document.addEventListener("mouseup", (e) => {
  if (e.button == 2) rightDown = false;
  if (e.button == 0) leftDown = false;
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
    async (response: BgResponse) => {
      console.log("ocr text : " + response.text);

      // do translate
      //translator.requestTranslation("this is the sample text", "korean");

      // img test code
      // fetch(response.base64)
      //   .then((base64) => base64.blob())
      //   .then((blob) => {
      //     console.log(blob);

      //     // img crop visual test
      //     const img = new Image();
      //     const url = URL.createObjectURL(blob);
      //     img.src = url;
      //     document.querySelector("body")?.appendChild(img);
      //   });
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

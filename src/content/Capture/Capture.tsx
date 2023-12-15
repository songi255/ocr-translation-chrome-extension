import React, { useContext, useEffect, useState } from "react";
import { CaptureGuideMask, CaptureGuideLine } from "./CaptureGuide";

interface CaptureProps {
  setCaptureMode: (isCaptureMode: boolean) => void;
}

function Capture({ setCaptureMode }: CaptureProps) {
  const [crop, setCrop] = useState({
    devicePixelRatio: window.devicePixelRatio,
  } as Crop);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 } as Point);

  useEffect(() => {
    addMouseListeners();
    return () => {
      removeMouseListeners();
    };
  }, [crop]);

  /* mouse Listeners */

  function addMouseListeners() {
    window.addEventListener("mousedown", mouseDownListener);
    window.addEventListener("mouseup", mouseUpListener);
    window.addEventListener("mousemove", mouseMoveListener);
  }

  function removeMouseListeners() {
    window.removeEventListener("mousedown", mouseDownListener);
    window.removeEventListener("mouseup", mouseUpListener);
    window.removeEventListener("mousemove", mouseMoveListener);
  }

  function mouseDownListener(ev: MouseEvent) {
    setCrop({ ...crop, startPoint: { x: ev.clientX, y: ev.clientY } });
  }

  function mouseUpListener(ev: MouseEvent) {
    const finalCrop = { ...crop, endPoint: { x: ev.clientX, y: ev.clientY } };
    if (
      finalCrop.startPoint?.x === finalCrop.endPoint.x ||
      finalCrop.startPoint?.y === finalCrop.endPoint.y
    ) {
      console.error("capture region size can't be zero.");
      return;
    }

    chrome.runtime.sendMessage({
      eventType: "request-screenshot",
      message: finalCrop,
    } as Message);

    setCrop({ devicePixelRatio: window.devicePixelRatio });
    setCaptureMode(false);
  }

  function mouseMoveListener(ev: MouseEvent) {
    setMousePos({ x: ev.clientX, y: ev.clientY });
  }

  return (
    <>
      <CaptureGuideMask
        crop={{ ...crop }}
        mousePos={{ ...mousePos } as Point}
      />
      <CaptureGuideLine mousePos={{ ...mousePos } as Point} />
    </>
  );
}

export default Capture;

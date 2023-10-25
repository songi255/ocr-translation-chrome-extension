import React from "react";
import "./CaptureGuide.scss";
import { getOrderedPoints } from "../../utils/utils";

interface MaskProps {
  crop: Crop;
  mousePos: Point;
}

function CaptureGuideMask({ crop, mousePos }: MaskProps) {
  const [sp, ep] = getOrderedPoints(crop.startPoint ?? mousePos, mousePos);
  const w = ep.x - sp.x;
  const h = ep.y - sp.y;

  const sw = window.innerWidth;
  const sh = window.innerHeight;

  return (
    <>
      <div
        className="cg-mask cg-mask-top"
        style={getMaskStyle(0, 0, sw, sp.y)}
      ></div>
      <div
        className="cg-mask cg-mask-left"
        style={getMaskStyle(sp.y, 0, sp.x, h)}
      ></div>
      <div
        className="cg-mask cg-mask-right"
        style={getMaskStyle(sp.y, ep.x, sw - ep.x, h)}
      ></div>
      <div
        className="cg-mask cg-mask-bottom"
        style={getMaskStyle(ep.y, 0, sw, sh - ep.y)}
      ></div>
    </>
  );
}

function getMaskStyle(
  top: number,
  left: number,
  width: number,
  height: number
) {
  return { top, left, width, height };
}

interface LineProps {
  mousePos: Point;
}

function CaptureGuideLine({ mousePos }: LineProps) {
  return (
    <div className="cg-lines">
      <div className="cg-hline" style={{ top: `${mousePos.y}px` }}></div>
      <div className="cg-vline" style={{ left: `${mousePos.x}px` }}></div>
    </div>
  );
}

export { CaptureGuideMask, CaptureGuideLine };

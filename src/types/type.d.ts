declare namespace chrome.runtime {
  function getContexts(any): any;
}

// interfaces

interface BgMessage {
  eventType: "request-operation";
  cropPos: Crop;
}

interface BgResponse {
  base64: string;
  text: string;
}

interface OcrRequest {
  eventType: "request-ocr";
  base64: string;
}

interface OcrResponse {
  eventType: "response-ocr";
  text: string;
}

interface Crop {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  devicePixelRatio: number;
}

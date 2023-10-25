declare namespace chrome.runtime {
  function getContexts(any): any;
}

// interfaces

interface Message {
  eventType:
    | "start-capture"
    | "request-screenshot"
    | "request-operation"
    | "response-operation"
    | "show-result";
  message?: any;
}

interface Point {
  x: number;
  y: number;
}

interface Crop {
  startPoint?: Point;
  endPoint?: Point;
  devicePixelRatio?: number;
}

interface TranslateResult {
  originalText: string;
  translatedText: string;
}

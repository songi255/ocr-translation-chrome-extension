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

interface Crop extends Message {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  devicePixelRatio: number;
}

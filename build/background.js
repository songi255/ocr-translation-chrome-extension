(()=>{"use strict";var e={860:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.capture=void 0;const r=new class{capture(e,t){const r=Math.min(e.sx,e.ex),a=Math.min(e.sy,e.ey),n=Math.max(e.sx,e.ex),o=Math.max(e.sy,e.ey),s=n-r,c=o-a;chrome.tabs.captureVisibleTab({format:"png"},(e=>{const n=new Image;n.onload=()=>{const e=new OffscreenCanvas(s,c),o=e.getContext("2d");null==o||o.drawImage(n,r,a,s,c,0,0,s,c),e.convertToBlob().then((e=>{t(e)}))}}))}saveToFile(){}};t.capture=r}},t={};function r(a){var n=t[a];if(void 0!==n)return n.exports;var o=t[a]={exports:{}};return e[a](o,o.exports,r),o.exports}(()=>{const e=r(860);chrome.runtime.onMessage.addListener(((t,r,a)=>{if("request-operation"===t.eventType)return console.log("recieved message"),e.capture.capture(t.cropPos,(e=>{a({original:"original text",translated:"translated text"})})),!0}))})()})();
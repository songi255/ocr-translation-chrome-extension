class Viewer {
  registerViewer() {
    chrome.runtime.onMessage.addListener((message: Message) => {
      if (message.eventType === "show-result") {
        const resultText = message.message;
        this.view(resultText);
      }
    });
  }

  view(message: any) {
    console.log(message);
  }
}

const viewer = new Viewer();
export { viewer };

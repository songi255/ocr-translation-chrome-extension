class Capture {
  private state: "idle" | "capture" = "idle";
  private crop = {} as Crop;

  enterCaptureMode() {
    if (this.state !== "idle")
      throw new Error("Only can enter from IDEL state.");

    this.state = "capture";
    this.crop.devicePixelRatio = window.devicePixelRatio;

    this.installGuide();
  }

  pickFirstPoint(e: MouseEvent) {
    this.crop.sx = e.clientX;
    this.crop.sy = e.clientY;
  }

  pickSecondPoint(e: MouseEvent) {
    this.crop.ex = e.clientX;
    this.crop.ey = e.clientY;
  }

  requestCapture() {
    if (this.crop.ex == this.crop.sx || this.crop.ey == this.crop.sy)
      throw new Error("capture resion size can't be zero.");

    chrome.runtime.sendMessage({
      eventType: "request-screenshot",
      message: { ...this.crop },
    } as Message);
  }

  endCapture() {
    if (this.state === "idle") return;
    this.state = "idle";

    this.unInstallGuide();
  }

  installGuide() {
    document.body.style.cursor = "crosshair";
  }

  unInstallGuide() {
    document.body.style.cursor = "auto";
  }

  installScript() {
    window.addEventListener("mousedown", (e) => this.mouseDownListner(e));
    window.addEventListener("mousemove", (e) => this.mouseMoveListner(e));
    window.addEventListener("mouseup", (e) => this.mouseUpListner(e));
  }

  mouseDownListner(e: MouseEvent) {
    if (this.state === "idle") return;
    e.preventDefault();
    e.stopPropagation();
    this.pickFirstPoint(e);
  }

  mouseMoveListner(e: MouseEvent) {
    if (this.state === "idle") return;
  }

  mouseUpListner(e: MouseEvent) {
    if (this.state === "idle") return;

    e.preventDefault();
    e.stopPropagation();
    this.pickSecondPoint(e);

    console.log(this.crop);

    try {
      this.requestCapture();
    } catch (error) {
      console.error(error);
    } finally {
      this.endCapture();
    }
  }
}

const capture = new Capture();
export { capture };

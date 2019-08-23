export class FrameRater {
  constructor() {
    // this._fps = 0;
    // this._fCount = 0;
    // this.reset();
    // this.stop();
  }

  _reset() {
    this._startTime = Date.now();
    this._fCount = 0;
    this._fps = 0;
  }

  start() {
    this._reset();
    this._running = true;
    this._update();
  }

  stop() {
    this._running = false;
  }

  get fps() {
    return this._fps;
  }

  _update() {
    this._fCount += 1;
    const elapsed = (Date.now() - this._startTime) / 1000;
    this._fps = (this._fCount / elapsed).toFixed(3);
    if (this._running) {
      requestAnimationFrame(() => {
        this._update();
      });
    }
  }
}
export default FrameRater;

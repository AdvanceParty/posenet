const CONFIDENCE = require('./confidence');
const PARTS = require('./parts');

const THRESHOLD = {
  LOW: 0,
  MEDIUM: 0.8,
  HIGH: 0.85,
  VERY_HIGH: 0.9,
};

export class Keypoint {
  constructor() {
    this._score = null;
    this._x = null;
    this._y = null;
    this._part = null;
    this._confidence = null;
  }

  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get position() {
    return { x: this.x, y: this.y };
  }
  get confidence() {
    return this._confidence;
  }
  get part() {
    return this._part;
  }

  get score() {
    return this._score;
  }

  set score(val) {
    const score = parseFloat(val) || null;
    this._confidence =
      score != null
        ? score >= THRESHOLD.MEDIUM
          ? score >= THRESHOLD.HIGH
            ? score >= THRESHOLD.VERY_HIGH
              ? CONFIDENCE.VERY_HIGH
              : CONFIDENCE.HIGH
            : CONFIDENCE.MEDIUM
          : CONFIDENCE.LOW
        : null;
    this._score = score;
    return this.score;
  }

  set part(str) {
    this._part = Object.values(PARTS).includes(str) ? str : null;
    return this.part;
  }

  set x(pos) {
    this._x = Math.round(pos);
  }
  set y(pos) {
    this._y = Math.round(pos);
  }

  set position({ x, y }) {
    this.x = x;
    this.y = y;
  }

  parse(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    const { position = { x: null, y: null }, score, part } = data;
    const { x, y } = position;

    this.score = score;
    this.position = { x, y };
    this.part = part;

    return this; // allows chaining, eg const foo = new Keypoint().parse(data)
  }

  stringify() {
    return JSON.stringify({
      point: this.position,
      score: this.score,
      part: this.part,
    });
  }

  prettyPrint() {
    return `${this.part.padEnd(13)} | Score: ${this.score.toFixed(5)} | Confidence: ${
      this.confidence
    } | pos: ${this.x}, ${this.y}`;
  }

  clone() {
    return new Keypoint().parse(this.stringify());
  }
}

export default Keypoint;

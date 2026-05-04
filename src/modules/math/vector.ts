import * as _Math from "./math";

export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  mag(x) {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x *= x / mag;
    this.y *= x / mag;
  }

  add(b) {
    this.x += b.x;
    this.y += b.y;
  }

  invert() { return new Vector(-this.x, -this.y); }

  copy() { return new Vector(this.x, this.y); }
}

let is_init = false;
export function init() {
  if (is_init) return;
  _Math.init();
  Math.vector = {
    add: (a, b) => new Vector(a.x + b.x, a.y + b.y),
    sub: (a, b) => new Vector(a.x - b.x, a.y - b.y),
    distance: (a, b) => Math.distance(a.x, a.y, b.x, b.y)
  }
  is_init = true;
}
modules.math = {
  title: 'math', v: '1.1',
  distance: (x1, y1, x2, y2) => { return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)); },
  direction: (x1, y1, x2, y2) => { return Math.atan2(y2 - y1, x2 - x1); },
  distanddir: (x1, y1, x2, y2) => { return { dist: modules.math.distance(x1, y1, x2, y2), dir: modules.math.direction(x1, y1, x2, y2) }; },
  sign: x => { return ((Math.round(x) > 0) - (Math.round(x) < 0)) * (Math.round(x) != 0); },
  clamp: (x, min, max) => { return Math.min(Math.max(x, min), max); },
  torad: x => { return x * Math.PI / 180; },
  todeg: x => { return x / Math.PI * 180; },
  log: (x, y) => { return Math.log(y) / Math.log(x); },
  lerp: (a, b, t) => { return a + t * (b - a); },
  vector: function(args) {
    let vec = new Vector();
    for (let i = 0; i < arguments.length; i += 2) vec.add(arguments[i], arguments[i + 1]);
    return vec;
  }
};

class Vector {
  constructor(arr) { this.points = arr || []; }
  draw(cvs, mode='stroke', color='#000') {
    if (modules.graphics) {
      cvs.beginPath();
        for (let i = 0; i < this.points.length; i++) {
          cvs.lineTo(this.points[i].x, this.points[i].y);
        }
      cvs.closePath();
      cvs[`${mode}Style`] = color;
      cvs[mode]();
    }
  }
  add(x, y) { this.points.push({ x: x, y: y }); }
  sum(x, y) {
    if (typeof(x) == 'object') {
      if (x instanceof Vector) {
        for (let i = 0; i < x.points.length; i++) {
          this.points[i].x += x.points[i].x;
          this.points[i].y += x.points[i].y;
        }
      } else this.points = this.points.map(i => { return { x: i.x + x.x, y: i.y + x.y }; });
    } else this.points = this.points.map(i => { return { x: i.x + x, y: i.y + (y || x) }; });
  }
  multi(x, y) {
    if (typeof(x) == 'object') {
      if (x instanceof Vector) {
        for (let i = 0; i < x.points.length; i++) {
          this.points[i].x *= x.points[i].x;
          this.points[i].y *= x.points[i].y;
        }
      } else this.points = this.points.map(i => { return { x: i.x * x.x, y: i.y * x.y }; });
    } else this.points = this.points.map(i => { return { x: i.x * x, y: i.y * (y || x) }; });
  }
  clear(start, count=1) {
    if (start != undefined) {
      let nstart = start < 0 ? this.points.length + start : start;
      this.points.splice(nstart, nstart + count);
    } else this.points = [];
  }
}

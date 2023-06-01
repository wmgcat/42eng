
math.vector = function(args) {
  let vec = new Vector();
  for (let i = 0; i < arguments.length; i += 2) vec.add(arguments[i], arguments[i + 1]);
  return vec;
}

class Vector {
  constructor(arr) { this.points = arr || []; }
  draw(cvs, mode='stroke', color='#000', cap='butt', join='miter') {
    if (modules.graphics) {
      cvs.beginPath();
      cvs.lineCap = cap;
      cvs.lineJoin = join;
        cvs.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          cvs.lineTo(this.points[i].x, this.points[i].y);
        }
      cvs.closePath();
      cvs[`${mode}Style`] = color;
      cvs[mode]();
      cvs.lineCap = 'butt';
      cvs.lineJoin = 'miter';
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
/*
modules.math = {
  vector: function(args) {
    let vec = new Vector();
    for (let i = 0; i < arguments.length; i += 2) vec.add(arguments[i], arguments[i + 1]);
    return vec;
  }
};

class Vector {
  constructor(arr) { this.points = arr || []; }
  draw(cvs, mode='stroke', color='#000', cap='butt', join='miter') {
    if (modules.graphics) {
      cvs.beginPath();
      cvs.lineCap = cap;
      cvs.lineJoin = join;
        cvs.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          cvs.lineTo(this.points[i].x, this.points[i].y);
        }
      cvs.closePath();
      cvs[`${mode}Style`] = color;
      cvs[mode]();
      cvs.lineCap = 'butt';
      cvs.lineJoin = 'miter';
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
*/
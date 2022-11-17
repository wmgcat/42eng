modules.math = {
  title: 'math', v: '1.0',
  distance: (x1, y1, x2, y2) => { return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)); },
  direction: (x1, y1, x2, y2) => { return Math.atan2(y2 - y1, x2 - x1); },
  sign: x => { return ((Math.round(x) > 0) - (Math.round(x) < 0)) * (Math.round(x) != 0); },
  clamp: (x, min, max) => { return Math.min(Math.max(x, min), max); },
  torad: x => { return x * Math.PI / 180; },
  todeg: x => { return x / Math.PI * 180; }
}

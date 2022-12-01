modules.graphics = {
  title: 'graphics', v: '1.0',
  init: context2d => {
    modules.graphics.cvs = context2d;
    return modules.graphics;
  },
  save: func => {
    let _save = {
      fillStyle: modules.graphics.cvs.fillStyle, strokeStyle: modules.graphics.cvs.strokeStyle,
      globalAlpha: modules.graphics.cvs.globalAlpha, lineWidth: modules.graphics.cvs.lineWidth,
      font: modules.graphics.cvs.font
     };
     if (func) func();
     Object.keys(_save).forEach(key => { modules.graphics.cvs[key] = _save[key]; });
  },
  rect: (x, y, w, h, colour='#000', alpha, type='fill', lw) => {
    modules.graphics.save(() => {
      if (alpha != undefined) modules.graphics.cvs.globalAlpha = alpha;
      modules.graphics.cvs.lineWidth = lw || 1;
      modules.graphics.cvs[type + 'Style'] = colour;
      modules.graphics.cvs[type + 'Rect'](x, y, w, h);
    });
    return { x: x, y: y, w: w, h: h };
  },
  round: (x, y, w, h, range, colour='#000', alpha, type='fill', lw) => {
    modules.graphics.save(() => {
      if (alpha != undefined) modules.graphics.cvs.globalAlpha = alpha;
      modules.graphics.cvs.lineWidth = lw || 1;
      modules.graphics.cvs[type + 'Style'] = colour;
      modules.graphics.cvs.beginPath();
        modules.graphics.cvs.lineTo(x, y + range);
        modules.graphics.cvs.quadraticCurveTo(x, y, x + range, y);
        modules.graphics.cvs.lineTo(x + range, y);
        modules.graphics.cvs.lineTo(x + w - range, y);
        modules.graphics.cvs.quadraticCurveTo(x + w, y, x + w, y + range);
        modules.graphics.cvs.lineTo(x + w, y + h - range);
        modules.graphics.cvs.quadraticCurveTo(x + w, y + h, x + w - range, y + h);
        modules.graphics.cvs.lineTo(x + w - range, y + h);
        modules.graphics.cvs.lineTo(x + range, y + h);
        modules.graphics.cvs.quadraticCurveTo(x, y + h, x, y + h - range);
        modules.graphics.cvs.lineTo(x, y + h - range);
        modules.graphics.cvs.lineTo(x, y + range);
        modules.graphics.cvs[type]();
      modules.graphics.cvs.closePath();
    });
    return { x: x, y: y, w: w, h: h };
  },
  circle: (x, y, rad, start, end, colour='#000', alpha, type='fill', lw) => {
    modules.graphics.save(() => {
      if (alpha != undefined) modules.graphics.cvs.globalAlpha = alpha;
      modules.graphics.cvs.lineWidth = lw || 1;
      modules.graphics.cvs[type + 'Style'] = colour;
      modules.graphics.cvs.beginPath();
        modules.graphics.cvs.arc(x, y, rad, start, end);
        modules.graphics.cvs[type]();
      modules.graphics.cvs.closePath();
    });
  },
  ellipse: (x, y, w, h, colour='#000', alpha, type='fill', lw) => {
    modules.graphics.save(() => {
      if (alpha != undefined) modules.graphics.cvs.globalAlpha = alpha;
      modules.graphics.cvs.lineWidth = lw || 1;
      modules.graphics.cvs[type + 'Style'] = colour;
      modules.graphics.cvs.beginPath();
        modules.graphics.cvs.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        modules.graphics.cvs[type]();
      modules.graphics.cvs.closePath();
    });
  },
  len: (str, size=10, font='Arial') => {
    let savefont = modules.graphics.cvs.font;
    modules.graphics.cvs.font = size + 'px ' + (font || 'Arial');
    let width = modules.graphics.cvs.measureText(lang.use(str) || str).width;
    modules.graphics.cvs.font = savefont;
    return width;
  },
  text: (str, x, y, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) => {
    modules.graphics.save(() => {
      if (alpha != undefined) modules.graphics.cvs.globalAlpha = alpha;
      modules.graphics.cvs.lineWidth = lw || 1;
      modules.graphics.cvs[type + 'Style'] = colour;
      if (align) {
        let dt = align.split('-');
        if (dt) {
          if (dt[0]) modules.graphics.cvs.textAlign = dt[0];
          if (dt[1]) modules.graphics.cvs.textBaseline = dt[1];
        }
      }
      modules.graphics.cvs.font = `${size}px ${font}`;
      modules.graphics.cvs[type + 'Text'](lang.use(str) || str, x, y);
    });
    return modules.graphics.len(str, size, font);
  },
  wtext: (str, x, y, width, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) => {
    let pos = 0, nstr = '', spaces = [];
    if (typeof(str) == 'object') { assoc = str[1], str = (lang.use(str[0]) || str[0]); }
    else str = lang.use(str) || str;
    while (pos < str.length) {
      nstr += str[pos++];
      let w = modules.graphics.len(nstr, size, font);
      if (w >= width * .675) {
        spaces.push([pos, w]);
        nstr = '';
      }
    }
    if (nstr != '') spaces.push([text.length, modules.graphics.len(nstr, size, font)]);
    let yy = y;
    if (align) {
      let dt = align.split('-');
      switch(dt[1]) {
        case 'middle': yy = y - (spaces.length * size) * .5; break;
        case 'bottom': yy = y - (spaces.length * size); break;
      }
    }
    for (let i = 0, offset = 0; i < spaces.length; i++) {
      modules.graphics.text(text.slice(offset, spaces[i][0]), x, y + i * size, colour, alpha, size, font, type, align, lw);
      offset = spaces[i][0];
    }
    return { w: spaces[0][1], h: spaces.length * size };
  }
}
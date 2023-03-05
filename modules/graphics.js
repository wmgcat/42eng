Add.font = async (name, path) => { // load fonts:
  const src = new FontFace(name, `url(${path})`);
  document.fonts.add(src);
  try {
    let state = await src.load();
    return true;
  }
  catch(err) { Add.error(err, ERROR.NOFILE); }
}
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
    let width = modules.graphics.cvs.measureText(modules.language ? modules.language.use(str) : str).width;
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
      modules.graphics.cvs[type + 'Text'](modules.language ? modules.language.use(str) : str, x, y);
    });
    return modules.graphics.len(str, size, font);
  },
  wtext: (str, x, y, width, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) => {
    if (typeof(str) == 'object') { str = (lang.use(str[0]) || str[0], str[1]); }
    else str = modules.language ? modules.language.use(str) : str; 
    let sstr = str.split(' '), lines = [], save_i = 0;
    for (let i = 0; i < sstr.length; i++) {
      let substr = sstr.slice(save_i, i).join(' ')
      if (modules.graphics.len(substr, size, font) >= width) {
        lines.push(substr);
        save_i = i;
      }
    }
    if (save_i < sstr.length) lines.push(sstr.slice(save_i).join(' '));
    let yy = y;
    if (align) {
      let dt = align.split('-');
      switch(dt[1]) {
        case 'middle': yy = y - (lines.length * size) * .5; break;
        case 'bottom': yy = y - (lines.length * size); break;
      }
    }
    for (let i = 0; i < lines.length; i++) modules.graphics.text(lines[i], x, yy + i * size, colour, alpha, size, font, type, align, lw);
  },
  parseBB: str => {
    let res = str.matchAll(/\[(\w+)(=(#?[\w|\d]+))?\]([\w|\d|\s\!|А-я]+)\[\/(\w+)\]|([\w|\d\s|А-я]+)/gi), arr = [];
    while(!res.done) {
      let narr = res.next();
      if (narr.done) break;
      if (narr.value[1]) {
        narr.value[4].split(' ').forEach(e => {
          if (e != '') {
            arr.push({
              text: e,
              tag: narr.value[1],
              value: narr.value[3] || true
            });
          }
        });
      } else {
        narr.value[0].split(' ').forEach(e => { if (e != '') arr.push({ text: e }); });
      }
    }
    return arr;
  },
  drawBB: (str, x, y, width, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) => {
    let parse = modules.graphics.parseBB(str), lines = [],
        save_i = 0, yy = y;
    for (let i = 0; i < parse.length; i++) {
      let narr = parse.slice(save_i, i), nstr = '';
      narr.forEach(e => { nstr += e.text; });
      if (modules.graphics.len(nstr, size, font) >= width) {
        lines.push(narr);
        save_i = i;
      }
    }
    if (save_i < parse.length) lines.push(parse.slice(save_i));
    if (align) {
      let dt = align.split('-');
      switch(dt[1]) {
        case 'middle': yy = y - (lines.length * size) * .5; break;
        case 'bottom': yy = y - (lines.length * size); break;
      }
    }
    let rainbow_offset = 0;
    for (let i = 0; i < lines.length; i++) {
      let linestr = '';
      for (let j = 0; j < lines[i].length; j++) linestr += lines[i][j].text + ' ';
      let xx = x;
      if (align) {
        let dt = align.split('-');
        switch (dt[0]) {
          case 'center': xx -= modules.graphics.len(linestr, size, font) * .5; break;
        }
      }
      for (let j = 0; j < lines[i].length; j++) {
        let col = colour, is_default_draw = true;
        switch(lines[i][j].tag) {
          case 'col': col = lines[i][j].value; break;
          case 'shake':
            for (k = 0; k < lines[i][j].text.length; k++) {
              let subx = xx + modules.graphics.len(lines[i][j].text.slice(0, k), size, font) + size * .05 - (size * .1) * Math.random(),
                  suby = yy + i * size + size * .05 - (size * .1) * Math.random();
              modules.graphics.text(lines[i][j].text.slice(k, k + 1), subx, suby, col, alpha, size, font, type, 'left-middle', lw);
            }
            is_default_draw = false;
          break;
          case 'rainbow': {
            cols = ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'];
            for (k = 0; k < lines[i][j].text.length; k++) {
              col = cols[rainbow_offset++ % cols.length];
              let subx = xx + modules.graphics.len(lines[i][j].text.slice(0, k), size, font),
                  suby = yy + i * size + size * .1 * Math.sin(current_time * .005 + k);
              modules.graphics.text(lines[i][j].text.slice(k, k + 1), subx, suby, col, alpha, size, font, type, 'left-middle', lw);
            }
            is_default_draw = false;
          } break;
        }
        if (is_default_draw) modules.graphics.text(lines[i][j].text, xx, yy + i * size, col, alpha, size, font, type, 'left-middle', lw);
        xx += modules.graphics.len(lines[i][j].text + ' ', size, font); 
      }
    }
  }
}

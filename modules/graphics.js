Add.font = async (name, path) => { // load fonts:
  mloaded++;
  const src = new FontFace(name, `url(${path})`);
  document.fonts.add(src);
  try {
    let state = await src.load();
    loaded++;
    return true;
  }
  catch(err) { Add.error(err, ERROR.NOFILE); }
}
Add.textbox = () => {
  return {
    show: () => {
      if (bind && !bind.check('textbox')) {
        let input = document.createElement('textarea');
        input.style.position = 'fixed';
        input.style.zIndex = -9999;
        input.style.top = 0;
        input.style.left = 0;
        input.id = 'textbox42eng';
        bind.add('textbox');
        document.body.appendChild(input);
        input.focus();
        input.onblur = () => { Add.textbox.hide(); }
      }
    },
    value: () => {
      if (bind && bind.check('textbox')) return (document.getElementById('textbox42eng') && document.getElementById('textbox42eng').value) || "";
      return "";
    },
    hide: () => {
      if (bind && bind.check('textbox')) {
        if (document.getElementById('textbox42eng')) document.body.removeChild(document.getElementById('textbox42eng'));
        bind.clear('textbox');
      }
    }
  };
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
  text: function(args) {
    modules.graphics.save(() => {
      let is_width = arguments[3] && typeof(arguments[3]) != 'string', lines = [],
          text = '', x = arguments[1], y = arguments[2],
          color = arguments[3 + is_width] || '#000',  alpha = arguments[4 + is_width],
          fontsize = arguments[5 + is_width] || 10, font = arguments[6 + is_width] || 'Arial',
          type = arguments[7 + is_width] || 'fill', align = arguments[8 + is_width],
          linewidth = arguments[9 + is_width], width = is_width ? arguments[3] : -1;
      if (typeof(arguments[0]) == 'object') {
        if (arguments[0] instanceof BB) {
          let save_i = 0;
          for (let i = 0; i < arguments[0].get().length; i++) {
            let narr = arguments[0].get().slice(save_i, i), nstr = '';
            if (narr) {
              if (narr.forEach) narr.forEach(e => { nstr += e.text; });
              if (width != -1 && modules.graphics.len(nstr, fontsize, font) >= width) {
                lines.push(narr);
                save_i = i;
              }
            }
          }
          if (save_i < arguments[0].get().length) lines.push(arguments[0].get().slice(save_i));   
          is_width = true;
        } else {
          if (modules.language) text = language.use(arguments[0][0] || arguments[0][0], arguments[0][1]);
          else text = arguments[0].join(' ');
        }
      } else {
        if (modules.language) text = language.use(arguments[0]);
        else text = arguments[0];
      }
      if (lines.length <= 0 && is_width) {
        let save_i = 0, sstr = text.split(' ');
        for (let i = 0; i < sstr.length; i++) {
          let substr = sstr.slice(save_i, i).join(' ')
          if (modules.graphics.len(substr, fontsize, font) >= width) {
            lines.push(substr);
            save_i = i;
          }
        }
        if (save_i < sstr.length) lines.push(sstr.slice(save_i).join(' '));
      }
      if (align) {
        let parse = align.split('-');
        modules.graphics.cvs.textAlign = parse[0];
        modules.graphics.cvs.textBaseline = parse[1];
        if (is_width) {
          switch(parse[1]) {
            case 'middle': y -= lines.length * fontsize * .5; break;
            case 'bottom': y -= lines.length * fontsize; break;
          }
        }
      }
      modules.graphics.cvs.globalAlpha = alpha;
      if (linewidth) modules.graphics.cvs.lineWidth = linewidth;
      modules.graphics.cvs[`${type}Style`] = color;
      modules.graphics.cvs.font = `${fontsize}px ${font}`;
      if (!is_width) modules.graphics.cvs[`${type}Text`](text, x, y);
      else {
        let rainbow_offset = 0;
        for (let i = 0; i < lines.length; i++) {
          if (typeof(lines[i]) == 'object') {
            let linestr = '';
            for (let j = 0; j < lines[i].length; j++) linestr += lines[i][j].text + ' ';
            let xx = x;
            if (align) {
              let dt = align.split('-');
              switch (dt[0]) {
                case 'center': xx -= modules.graphics.len(linestr, fontsize, font) * .5; break;
              }
            }
            for (let j = 0; j < lines[i].length; j++) {
              let col = color, is_default_draw = true;
              switch(lines[i][j].tag) {
                case 'col': col = lines[i][j].value; break;
                case 'shake':
                  for (k = 0; k < lines[i][j].text.length; k++) {
                    let subx = xx + modules.graphics.len(lines[i][j].text.slice(0, k), fontsize, font) + fontsize * .05 - (fontsize * .1) * Math.random(),
                        suby = y + i * fontsize + fontsize * .05 - (fontsize * .1) * Math.random();
                    modules.graphics.text(lines[i][j].text.slice(k, k + 1), subx, suby, col, alpha, fontsize, font, type, 'left-middle', linewidth);
                  }
                  is_default_draw = false;
                break;
                case 'rainbow': {
                  cols = ['#9400D3', '#4B0082', '#0000FF', '#00FF00', '#FFFF00', '#FF7F00', '#FF0000'];
                  for (k = 0; k < lines[i][j].text.length; k++) {
                    col = cols[rainbow_offset++ % cols.length];
                    let subx = xx + modules.graphics.len(lines[i][j].text.slice(0, k), fontsize, font),
                        suby = y + i * fontsize + fontsize * .1 * Math.sin(current_time * .005 + k);
                    modules.graphics.text(lines[i][j].text.slice(k, k + 1), subx, suby, col, alpha, fontsize, font, type, 'left-middle', linewidth);
                  }
                  is_default_draw = false;
                } break;
              }
              if (is_default_draw) modules.graphics.text(lines[i][j].text, xx, y + i * fontsize, col, alpha, fontsize, font, type, 'left-middle', linewidth);
              xx += modules.graphics.len(lines[i][j].text + ' ', fontsize, font);
            }
          } else modules.graphics.text(lines[i], x, y + i * fontsize, color, alpha, fontsize, font, type, align, linewidth);
        }
      }
    });
  },
  parseBB: str => {
    let res = str.matchAll(/\[(\w+)(=(#?[\w|\d]+))?\]([\w|\d|\s\!\?\,|А-я]+)\[\/(\w+)\]|([\w|\d\s|А-я]+)/gi), arr = [];
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
    return new BB(arr);
  }
}

class BB {
  constructor(arr) { this.arr = arr; }
  get() { return this.arr; }
}

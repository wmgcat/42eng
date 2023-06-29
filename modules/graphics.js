/**
 * @file Модуль для графики
 * @author wmgcat
 * @version 1.1
*/

const graphics = new Module('graphics', '1.1'),
      types = {
        fill: 'fill',
        stroke: 'stroke'
      }

cfg.font = {
  name: 'Arial', // Стандартный шрифт
  size: 10 // Стандартный размер шрифта
}

/**
 * Возвращает модуль для отрисовки графики
 * @param {object} ctx Контекст холста на котором будет производиться отрисовка
 * @returns {object} this Возвращает себя
*/
graphics.create = function(ctx) {
  this.cvs = ctx;
  return this;
}

/**
 * Метод для отрисовки фигур с альфой и шириной линии
 * 
 * @param {function} func Функция для отрисовки фигуры
 * @param {string|object} color='#000' Цвет или текстура
 * @param {number} alpha=1 Прозрачность
 * @param {string} type='fill' Заполнение, может быть fill или stroke
 * @param {number} linewidth=1 Ширина линии, работает если указан stroke в заполнении
*/
graphics.save = function(func, color='#000', alpha=1, type=types.fill, linewidth=1) {
  if (type == types.stroke) this.cvs.lineWidth = linewidth;
  if (alpha != 1) this.cvs.globalAlpha = alpha;
  this.cvs[`${type}Style`] = color;
  func(this);
  if (alpha != 1) this.cvs.globalAlpha = 1;
}

/**
 * Рисует прямоугольник
 * 
 * @param {number} x X
 * @param {number} y Y
 * @param {number} w Ширина
 * @param {number} h Высота
 * @param {string|object} color='#000' Цвет или Текстура
 * @param {number} alpha=1 Прозрачность
 * @param {string} type='fill' Заполнение, может быть fill или stroke
 * @param {number} linewidth=1 Ширина линии, работает если указан stroke в заполнении
*/
graphics.rect = function(x, y, w, h, color='#000',
                         alpha=1, type=types.fill, linewidth=1) {
  this.save(e => e.cvs[`${type}Rect`](x, y, w, h),
            color, alpha, type, linewidth);
}

/**
 * Рисует прямоугольник с закругленными краями
 * 
 * @param {number} x X
 * @param {number} y Y
 * @param {number} w Ширина
 * @param {number} h Высота
 * @param {number|Array} range Скругление краев. Можно указать каждый угол отдельно, используя массив
 * @param {string|object} color='#000' Цвет или Текстура
 * @param {number} alpha=1 Прозрачность
 * @param {string} type='fill' Заполнение, может быть fill или stroke
 * @param {number} linewidth=1 Ширина линии, работает если указан stroke в заполнении
*/
graphics.round = function(x, y, w, h, range, color='#000',
                          alpha=1, type=types.fill, linewidth=1) {
  this.save(e => {
    e.cvs.beginPath();
      e.cvs.roundRect(x, y, w, h, range);
      e.cvs[type]();
    e.cvs.closePath();
  }, color, alpha, type, linewidth);
}

/**
 * Рисует круг
 * 
 * @param {number} x X
 * @param {number} y Y
 * @param {number} range Радиус
 * @param {number} start=0 Начало круга в радианах
 * @param {number} end=Math.PI*2 Конец круга в радианах
 * @param {string|object} color='#000' Цвет или Текстура
 * @param {number} alpha=1 Прозрачность
 * @param {string} type='fill' Заполнение, может быть fill или stroke
 * @param {number} linewidth=1 Ширина линии, работает если указан stroke в заполнении
*/
graphics.circle = function(x, y, range, start=0, end=Math.PI*2, color='#000',
                           alpha=1, type=types.fill, linewidth=1) {
  this.save(e => {
    e.cvs.beginPath();
      
      e.cvs.arc(x, y, range, start, end);
      e.cvs[type]();
    e.cvs.closePath();
  }, color, alpha, type, linewidth);
}

/**
 * Рисует эллипс
 * 
 * @param {number} x X
 * @param {number} y Y
 * @param {number} w Ширина
 * @param {number} h Высота
 * @param {string|object} color='#000' Цвет или Текстура
 * @param {number} alpha=1 Прозрачность
 * @param {string} type='fill' Заполнение, может быть fill или stroke
 * @param {number} linewidth=1 Ширина линии, работает если указан stroke в заполнении
*/
graphics.ellipse = function(x, y, w, h, color='#000',
                            alpha=1, type=types.fill, linewidth=1) {
  this.save(e => {
    e.cvs.beginPath();
      e.cvs.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
      e.cvs[type]();
    e.cvs.closePath();
  }, color, alpha, type, linewidth);
}

/**
 * Рисует текст
 * @namespace
 * @memberof graphics
*/
graphics.text = {}

/**
 * Рисует текст
 * 
 * @param {string} str Текст
 * @param {number} x X
 * @param {number} y Y
 * @param {string|object} [color=#000] Цвет или Текстура
 * @param {number} [alpha=1] Прозрачность
 * @param {number} [fontsize=cfg.font.size] Размер шрифта
 * @param {string} [font=cfg.font.name] Название шрифта
 * @param {string} [align=left-top] Положение текста
 * @param {string} [type=fill] Заполнение, может быть fill или stroke
 * @param {number} [linewidth=1] Ширина линии, работает если указан stroke в заполнении
*/
graphics.text.draw = function(str, x, y, color='#000', alpha=1, fontsize=cfg.font.size,
                              font=cfg.font.name, align='left-top', type=types.fill, linewidth=1) {
  graphics.save(e => {
    e.cvs.font = `${fontsize}px ${font}`;
    align = align.split('-');
    if (align[0]) e.cvs.textAlign = align[0];
    if (align[1]) e.cvs.textBaseline = align[1];
    e.cvs[`${type}Text`](str, x, y);
  }, color, alpha, type, linewidth);
}

/**
 * Рисует текст с переносом строки
 * 
 * @param {string} str Текст
 * @param {number} x X
 * @param {number} y Y
 * @param {number} width Ширина текста
 * @param {string|object} [color=#000] Цвет или Текстура
 * @param {number} [alpha=1] Прозрачность
 * @param {number} [fontsize=cfg.font.size] Размер шрифта
 * @param {string} [font=cfg.font.name] Название шрифта
 * @param {string} [align=left-top] Положение текста
 * @param {string} [type=fill] Заполнение, может быть fill или stroke
 * @param {number} [linewidth=1] Ширина линии, работает если указан stroke в заполнении
 */
graphics.text.drawMultiLine = function(str, x, y, width, color='#000', alpha=1, fontsize=cfg.font.size,
                        font=cfg.font.name, align='left-top', type=types.fill, linewidth=1) {
  graphics.save(e => {
    e.cvs.font = `${fontsize}px ${font}`;
    align = align.split('-');

    const lines = typeof(str) == 'object' ? str : this.multiLine(str, width, fontsize, font);

    let yy = y;
    if (align[0]) e.cvs.textAlign = align[0];
    if (align[1]) {
      e.cvs.textBaseline = align[1];
      if (align[1] == 'middle') yy -= lines.length * fontsize * .5;
      if (align[1] == 'bottom') yy -= lines.length * fontsize;
    }

    for (let i = 0; i < lines.length; i++)
      e.cvs[`${type}Text`](lines[i], x, yy + fontsize * i);

  }, color, alpha, type, linewidth);
}

/**
 * Возвращает длину текста
 *
 * @param {string} str текст
 * @param {number} [fontsize=cfg.font.size] Размер шрифта
 * @param {string} [font=cfg.font.name] Название шрифта
 * @return {number}
*/
graphics.text.width = function(str, fontsize=cfg.font.size, font=cfg.font.name) {
  graphics.cvs.font = `${fontsize}px ${font}`;
  return graphics.cvs.measureText(str).width;
}

/**
 * Разделяет текст на строки
 * 
 * @param  {string} str Текст
 * @param  {number} width Максимальная ширина строки
 * @param  {number} fontsize Размер шрифта
 * @param  {string} font Название шрифта
 * @return {array}
*/
graphics.text.multiLine = function(str, width, fontsize=cfg.font.size, font=cfg.font.name) {
  graphics.cvs.font = `${fontsize}px ${font}`;
  const lines = [],
        parseText = str.split(' ');
  let offset = 0;
  for (let i = 0; i < parseText.length; i++) {
    const line = parseText.slice(offset, i).join(' ');
    if (this.width(line, fontsize, font) >= width) {
      lines.push(parseText.slice(offset, i).join(' '));
      offset = i;
    }
  }
  lines.push(parseText.slice(offset).join(' '));

  return lines;
}

/**
 * Паттерн
 * @type {Pattern}
 * @memberof graphics
*/
class Pattern {
  /**
   * @param {object} cvs Основной контекст
   * @param {_Image} image Объект класса _Image
   * @param {string} repeat Режим повтора
   *
   * @example
   * const grass = new Pattern(canvas.cvs, image.grass, repeat='repeat-x');
   * graphics.rect(0, 0, 32, 32, grass.pattern, 1);
  */
  constructor(cvs, image, repeat='repeat') {
    this.canvas = document.createElement('canvas');
    this.context2d = this.canvas.getContext('2d');
    this.image = image;
    this.canvas.width = this.image.w;
    this.canvas.height = this.image.h;
    this.repeat = repeat;
    this.update(cvs); 
  }

  /**
   * Обновление паттерна (нужно для анимаций)
   * 
   * @param  {object} cvs Основной контекст
  */
  update(cvs) {
    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.image.draw(this.context2d, this.image.xoff, this.image.yoff);
    this.pattern = cvs.createPattern(this.canvas, this.repeat);
  }
}

/**
 * Добавляет шрифт
 * 
 * @param  {string} path Путь к файлу
 * @param  {string} name Название шрифта
 * @return {bool}
*/
Add.font = async function(path, name) {
  mloaded++;
  const font = new FontFace(name, `url(${path})`);
  document.fonts.add(font);
  try {
    let state = await font.load();
    loaded++;
    return true;
  }
  catch(err) { return this.error(err, ERROR.NOFILE); }
}
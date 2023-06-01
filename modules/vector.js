/**
 * @file Модуль векторов
 * @author wmgcat
 * @version 1.0
*/

/**
 * Создает вектор из точек
 * 
 * @param  {number[]} args Точки вектора
 * @return {Vector}
*/
Add.vector = function(args) {
  let vec = new Vector();
  for (let i = 0; i < arguments.length; i += 2) vec.add(arguments[i], arguments[i + 1]);
  return vec;
}

/**
 * Вектор
 * @constructor
*/
class Vector {
  /**
   * @param  {array} arr Массив точек
  */
  constructor(arr) { this.points = arr || []; }

  /**
   * Рисует вектор
   * 
   * @param  {object} cvs Канвас
   * @param  {string} [mode=stroke] Режим рисования
   * @param  {string} [color=#000] Цвет
   * @param  {string} [cap=butt] Тип линии
   * @param  {string} [join=miter] Тип соединений
  */
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

  /**
   * Добавляет новые точки в вектор
   * 
   * @param {number} x X
   * @param {number} y Y
  */
  add(x, y) { this.points.push({ x: x, y: y }); }

  /**
   * Складывает вектор с вектором или с числами
   * 
   * @param  {number|Vector} x X или Вектор
   * @param  {number} y Y
  */
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

  /**
   * Умножает вектор с вектором или с числами
   * 
   * @param  {number|Vector} x X или Вектор
   * @param  {number} y Y
  */
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

  /**
   * Очищает значения вектора
   * 
   * @param  {number} start Начальная точка, если не задана, то очищает весь вектор
   * @param  {number} [count=1] Кол-во элементов для удаления
  */
  clear(start, count=1) {
    if (start != undefined) {
      let nstart = start < 0 ? this.points.length + start : start;
      this.points.splice(nstart, nstart + count);
    } else this.points = [];
  }
}
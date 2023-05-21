/**
 * @file Модуль таймеров
 * @author wmgcat
 * @version 1.1
*/

const timer = new Module('timer', '1.1');

/**
 * Возвращает объект класса Timer
 * 
 * @param  {number} x Кол-во секунд, минут, часов
 * @param  {number} [multi=1000] Счетчик, по умолчанию установлен на секунды
 * @return {Timer}
*/
timer.create = (x, multi=1000) => {
  const _timer = new Timer(x, multi);
  return _timer;
}

/**
 * Класс для таймеров
 * 
 * @contructor 
*/
class Timer {
  /**
   * @param  {number} x Кол-во секунд, минут, часов
   * @param  {number} [multi=1000] Счетчик, по умолчанию установлен на секунды
  */
  constructor(x, multi=1000) {
    this.point = 0;
    this.max = x * multi;
    this.save_max = x;
    this.reset();
  }

  /**
   * Возвращает true если счетчик выполнился
   * 
   * @param  {bool} [loop=false] Сбрасывает счетчик по истечению времени
   * @return {bool}
  */
  check(loop=false) {
    if ((this.point - Date.now()) > 0) return false;

    if (loop) this.reset();
    return true;
  }

  /**
   * Возвращает значение счетчика от 0 до 1
   * 
   * @return {number}
  */
  delta() {
    if (!modules.math) return 0;
    return modules.math.clamp(Math.max(this.point - Date.now(), 0) / this.max, 0, 1);
  }
  
  /**
   * Возвращает кол-во прохождения счетчика по таймру с момента запуска
   * 
   * @return {number}
  */
  count() {
    return ~~(Math.abs(this.point - Date.now()) / this.max);
  }

  /**
   * Сбрасывает счетчик, если указан X, то ставит значение счетчика на X
   * 
   * @param  {number} [x=0] Значение счетчика
  */
  reset(x=0) {
    if (!x) this.point = Date.now() + this.max;
    else this.point = x;
  }
}
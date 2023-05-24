/**
 * @file Модуль проверки значений
 * @author wmgcat
 * @version 1.2
*/

const byte = new Module('byte', '1.2');

ERROR.NOKEY = 3; // Добавляет ошибку неизвестного ключа

/**
 * Проверка значений
 * 
 * @constructor
*/
class Byte {
  /**
   * @param  {string} key Ключ, можно указать несколько
  */
  constructor(...args) {
    this.keys = {};
    this.key = 0;
    
    let offset = 0;
    for (const key of args) {
      if (!(key in this.keys))
        this.keys[key] = !offset + (2 << (offset - 1));
      offset++;
    }
  }

  /**
   * Добавляет ключ в значение
   * 
   * @param {string} key Ключ, можно указать несколько
  */
  add(...args) {
    try {
      for (const key of args) {
        if (!(key in this.keys)) throw new Error(key);
        this.key |= this.keys[key];
      }
    }
    catch(err) { return Add.error(err, ERROR.NOKEY); }
  }

  /**
   * Очищает ключ из значения
   * 
   * @param {string} key Ключ, можно указать несколько
  */
  clear(...args) {
    try {
      for (const key of args) {
        if (!(key in this.keys)) throw new Error(key);
        this.key &=~ this.keys[key];
      }
    }
    catch(err) { return Add.error(err, ERROR.NOKEY); }
  }

  /**
   * Проверяет ключи в значении
   *
   * @param {string} key Ключ, можно указать несколько
  */
  check(...args) {
    try {
      for (const key of args) {
        if (!(key in this.keys)) throw new Error(key);
        if ((this.key & this.keys[key]) <= 0) return false;
      }
      return true;
    }
    catch(err) { return Add.error(err, ERROR.NOKEY); }
  }
}
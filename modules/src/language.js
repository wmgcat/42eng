/**
 * @file Модуль локализации
 * @author wmgcat
 * @version 2.0
*/

const table = {};
let select = '';
const regex = /#\{([^}]+)\}/g;

class Language {
  constructor(short, json, primary=false) {
    this._short = short;
    this.source = json;
    this.data = recursiveTableMove(json);
    table[short] = this;
    
    if (primary)
      select = short;
  }
}


/**
 * Перевод текста на выбранную локализацию 
 * 
 * @param {string} [short=select] Короткое название для локализации
 * @return {string}
 */
String.prototype.use = function(short=select) {
  return this.replace(regex, (match, key) => (table[short].data.hasOwnProperty(key) ? table[short].data[key] : match));
}

/**
 * Рекурсивная функция для возвращения ключей
 * 
 * @param {object} obj Объект с ключами
 * @param {string|bool} [param=false] Параметр, который добавляется к ключам в новом объекте
 * @return {object}
*/
function recursiveTableMove(obj, param=false) {
  const nparam = param ? `${param}.` : '';
  let nobj = {};

  for (const key of Object.keys(obj)) {
    if (typeof(obj[key]) == 'object') {
      nobj = Object.assign({}, recursiveTableMove(obj[key], `${nparam}${key}`), nobj);
    } else
    nobj[`${nparam}${key}`] = obj[key];
  }

  return nobj;
}

function change(lang) {
  if (table[lang]) {
    select = lang;
  }
}

export {
  Language, table, select, change
}

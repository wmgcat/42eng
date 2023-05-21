/**
 * @file Модуль локализации
 * @author wmgcat
 * @version 1.2
*/

/**
 * Модуль локализации
 * @namespace
*/
const language = new Module('language', '1.2');

language.table = {};
language.select = '';

/**
 * Возвращает текст из таблицы локализации, подставляет значения в %s
 * 
 * @param  {string|array|number} args значения в таблице локалзации или аргументы для %s
 * @return {string}
*/
language.use = function(...args) {
  if (!args[0]) return false;

  let text = args[0], pos = 0,
      arr = this.table[this.select] || {};
  const path = text.split('.')

  while(arr[path[pos]]) {
    if (typeof(arr[path[pos]]) == 'string') {
      text = arr[path[pos]];
      break;
    }
    arr = arr[path[pos++]];
  }
  for (const param of args.splice(1, args.length - 1))
    text = text.replace('%s', `${this.use(param)}`);

  return text;
}

/**
 * Добавляет файл локализации
 * 
 * @param  {string} path путь к файлу локализации
 * @param  {string} short короткое название для локализации, например ru, en
 * @param  {bool} [primary=false] установить локализацию по умолчанию
 * @return {bool}
*/
Add.language = async function(path, short, primary=false) {
  try {
    mloaded++;
    const promise = new Promise((res, rej) => {
      const local = document.createElement('script');

      local.onload = () => {
        modules.language.table[short] = Eng.copy(Lang);
        if (primary) modules.language.select = short;
        loaded++;
        res(true);
      }
      local.onerror = () => rej(path);

      local.src = path;
      document.body.appendChild(local);
    });
    await promise;
  }
  catch(err) { return this.error(err, ERROR.NOFILE); }
  return true;
}
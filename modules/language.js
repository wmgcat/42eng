/**
 * @file Модуль локализации
 * @author wmgcat
 * @version 1.2
*/

/**
 * Модуль локализации
 * @namespace
*/
const language = new Module('language', '1.3');

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
  
  let text = ((this.table[this.select] || {})[args[0]]) || args[0];
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

        modules.language.table[short] = recursiveTableMove(Eng.copy(Lang));

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
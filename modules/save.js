/**
 * @file Модуль сохранений
 * @author wmgcat
 * @version 1.1
*/

export const save = {};

/**
 * Сохраняет данные в localStorage, возвращает объект с данными, которые можно сохранить на сервере
 * 
 * @param  {Object} data Данные, которые необходимо сохранить / обновить
 * @return {Object}
*/
save.set = async data => {
  localStorage.setItem('__savetime', Date.now());

  const obj = {};
  for (let [key, value] of Object.entries(data)) {
    value = typeof(value) == 'object' ? JSON.stringify(value) : value;

    localStorage.setItem(key, value);
    obj[key] = value;
  }
  return obj;
}

/**
 * Получает данные из localStorage, возвращает объект с данными или false
 * 
 * @param  {...string} keys Ключ, можно указать несколько
 * @return {Object}
*/
save.get = function(...keys) {
  const obj = {};
  for (const key of keys) {
    const value = this.check(key);
    if (value == null) continue;

    obj[key] = value;
  }
  return obj;
}

/**
 * Проверяет есть ли ключ в localStorage
 * 
 * @param  {string} key Ключ
 * @return {bool}
*/
save.check = key => {
  return localStorage.getItem(key);
}

/**
 * Очищает данные из localStorage, если аргументов нет - удаляет все данные!
 * 
 * @param  {...string} keys Ключ, можно указать несколько
*/
save.clear = function(...keys) {
  if (!keys) return localStorage.clear();

  for (const key of keys)
    localStorage.removeItem(key);
}
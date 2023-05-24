/**
 * @file Модуль для поиска объектов
 * @author wmgcat
 * @version 1.2
*/

const search = new Module('search', '1.2');

/**
 *  Поиск объектов по дистанции
 * 
 * @param  {string|string[]} name Название объекта
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} distance Дистанция
 * @param  {number} [offset=0] Отступ от искомого объекта
 * @return {array}
*/
search.distance = (name, x, y, distance, offset=0) => {
  if (!modules.math) return false;
  return modules.search.search(name).filter(obj => (modules.math.distance(x, y, obj.x + offset, obj.y + offset) <= distance));
}

/**
 * Поиск объектов по ID
 * 
 * @param  {arguments[]} id ID объектов, можно искать несколько
 * @return {array}
*/
search.id = (...args) => {
  let arr = [];
  for (const id of args)
    if (objects[id])
      arr.push(objects[id]);

  return arr;
}

/**
 * Поиск объектов по названию
 * 
 * @param  {arguments[]} name Имя объекта, можно указать несколько
 * @return {array}
*/
search.search = (...args) => (
  Object.keys(objects).filter(x => {
    for (const name of args) {
      if (name == 'all' || objects[x].name == name)
        return true;
    }
  }).map(x => objects[x])
);

/**
 * Показывает кол-во объектов по имени
 * 
 * @param  {arguments[]} name Имя объекта, можно указать несколько
 * @return {number}
*/
search.count = (...args) => modules.search.search(args).length;

/**
 * Поиск объектов по ключу
 * 
 * @param  {string|string[]} name Имя объекта, можно указать несколько
 * @param  {string} key Параметр для поиска
 * @param  {any} value Значение параметра
 * @return {array}
*/
search.key = (name, key, value) => modules.search.search(name).filter(x => (x[key] == value));
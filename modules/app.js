/**
 * @file Модуль для интеграции с electron
 * @author wmgcat
 * @version 1.0
*/

const app = new Module('app', '1.0');

/**
 * Инициализация приложения
*/
app.init = function() {
  try {
    const { ipcRenderer } = require('electron');
    this.ipc = ipcRenderer;
  }
  catch(err) {
    Add.error('Ошибка при require, проверьте что вы запускаете приложение через electron! Подробнее: ', err);
  }
}

/**
 * Отправка данных в приложение
 * 
 * @param  {string} id Клюс для отправки данных
 * @param  {...any} args Любые данные
 * @return {bool}
*/
app.setData = function(id, ...args) {
  if (!this.ipc) return false;

  this.ipc.send(id, ...args);
  return true;
}

/**
 * Получение данных из приложения
 * 
 * @param {string} id Ключ для получения данных
 * @param {function} func Функция, в которую передаются данные
 * @return {bool}
*/
app.getData = async function(id, func) {
  if (!this.ipc) return false;
  
  this.ipc.on(id, (e, data) => func(data));
  return true;
}
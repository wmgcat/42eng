/**
 * @file Модуль сокетов
 * @author wmgcat
 * @version 1.1
*/

const socket = new Module('socket', '1.1');

/**
 * Создает объект класса Socket
 * 
 * @param  {string} ip IP адрес веб-сокета
 * @param  {number} port Порт веб-сокета
 * @param  {bool} protect Защищенное подключение (WSS)
 * @return {Socket}
*/
socket.create = (ip, port, protect) => (
  new Socket(ip, port, protect)
);

/**
 * Сокет
 * @contructor
*/
class Socket {

  /**
   * @param  {string} [ip=localhost] IP адрес веб-сокета
   * @param  {number} [port=8080] Порт веб-сокета
   * @param  {bool} [protect=false] Защищенное подключение (WSS)
  */
  constructor(ip='localhost', port=8080, protect=false) {
    this.ip = ip;
    this.port = port;
    this.protect = protect;


    this.isOpen = false;
    this.socket = null;
  }

  /**
   * Подключение к веб-сокету
   *
   * @param {function} func Функция, принимающая данные с веб-сокета
   * @return {bool}
  */
  run(func) {
    if (this.isOpen) return false;

    this.socket = new WebSocket(`${this.protect ? 'wss' : 'wss'}://${this.ip}:${this.port}`);
    
    this.socket.onopen = e => {
      this.isOpen = true;
      Add.debug(`Подключение к ${this.ip} установлено! Порт: ${this.port}`);
    }

    this.socket.onerror = e => {
      Add.error(e.message, 0);
      this.isOpen = false;
    }

    this.socket.onclose = e => {
      if (!e.wasClean) Add.error(e.message, 0);
      this.isOpen = false;
      Add.debug('Подключение завершено!');
    }

    this.onmessage = e => func(JSON.parse(e.data));
  }

  /**
   * Отправляет данные на веб-сокет
   * 
   * @param  {string}
   * @param  {Object}
  */
  send(event, data) {
    if (!this.isOpen) return Add.error('Подключение закрыто!', 0);

    data.event = event;
    this.socket.send(JSON.stringify(data));
  }
}
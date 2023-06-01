/**
 * @file Основной функционал движка
 * @author wmgcat
*/

/**
 * Коды ошибок
 * @readonly
 * @enum {number}
*/
const ERROR = { 
  /** Отсутствует файл */
  NOFILE: 1,
  /** Не поддерживается */
  NOSUPPORT: 2 
}

/**
 * Конфигурация
 * 
 * @type {Object}
 * @property {string} [title=42eng.js] Название проекта
 * @property {string} [author=wmgcat] Автор проекта
 * @property {bool} [debug=false] Режим тестирования
 * @property {object} build Данные о движке
 * @property {string} build.v Версия движка
 * @property {string} [build.href=github.com/wmgcat/42eng] Ссылка на репозиторий
 * @property {number} [grid=32] Размер сетки
 * @property {number} [zoom=1] Увеличение
 * @property {object} window Параметры окна
 * @property {string} [window.id=game] ID холста
 * @property {number} [window.width=800] Ширина
 * @property {number} [window.height=600] Высота
 * @property {bool} [window.fullscreen=true] Полноэкранный режим
 * @property {string} [modulepath=./modules/] Путь до папки с модулями
 * @property {string} datapath Обрезание путей, для сокращения названий
 * @property {bool} [sort=true] Режим сортировки
 * @property {bool} [smooth=false] Режим сглаживания
 * @property {number} [pixel=window.devicePixelRatio] Пиксель
*/
let cfg = {
  title: '42eng.js',
  author: 'wmgcat',
  debug: false,
  build: {
    v: '1.7.5',
    href: 'github.com/wmgcat/42eng'
  },
  grid: 32,
  zoom: 1,
  window: {
    id: 'game',
    width: 800,
    height: 600,
    fullscreen: true
  },
  modulepath: './modules/',
  datapath: '',
  sort: true,
  smooth: false,
  pixel: window.devicePixelRatio
};

/**
 * Основной функционал движка
 * @namespace
*/
const Eng = {
  /**
   * Генерирует уникальный ID
   * @return {string}
  */
  id: () => {
    const gen4 = () => ((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${gen4()}_${gen4()}.${gen4()}`;
  },

  /**
   * Копирует объект
   * 
   * @param  {object} source Объект
   * @return {object}
  */
  copy: source => {
    let arr = {};
    Object.keys(source).forEach(function(e) { arr[e] = source[e]; });
    return arr;
  },

  /** Выводит информацию о проекте */
  console: () => {
    let img = [
      `информация о проекте:`,
      `${cfg.title} автор: ${cfg.author}`,
      `версия: ${cfg.build.v}`,
      `ссылка: ${cfg.build.href}`
    ]
    console.log(img.join('\n'));
  }
};

let loaded = 0, mloaded = 0, current_time = 0, current_level = 0, current_camera = 0;
let pause = false, editor = false, levelChange = false, is_touch = false;
let render = [], gui = [], cameraes = [{'x': 0, 'y': 0}], modules = {};
let keylocks = {}, grid = {}, levelMemory = {}, objects = {}, templates = {}, images = {};
let mouse = {x: 0, y: 0, touch: {x: 0, y: 0}}, bind = false;

/**
 * Добавление функционала
 * @namespace
*/
let Add = {
  /**
   * Настраивает управление с клавиатуры, работает с модулем byte
   * 
   * @param  {string|object} char Символ клавиатуры или объект с значениями
   * @param  {string} key Ключ, который будет присвоен
   *
   * @example
   * Add.rule('w', 'up')
   *
   * @example
   * Add.rule({
   *  w: 'up', s: 'down',
   *  a: 'left', d: 'right'
   * })
  */
  rule: function(char, key) {
    if (typeof(char) == 'object') { Object.keys(char).forEach(function(k) { keylocks[k] = char[k]; });
    } else {
      if (arguments.length > 2) for (let i = 0; i < arguments.length; i += 2) keylocks[arguments[i]] = arguments[i + 1];
      else keylocks[char] = key;
    }
  },

  /**
   * Добавление скриптов
   * 
   * @param  {string} source Путь к файлу
   * @return {bool}
   *
   * @example
   * Add.script('./function.js').then(() => {
   *  Add.debug("Файл загружен!");
   * });
  */
  script: async function(...args) {
    try {
      for (const path of Object.values(args)) {
        mloaded++;
        const promise = new Promise((res, rej) => {
          const script = document.createElement('script');
          script.onload = () => {
            loaded++;
            res(true);
          }
          script.onerror = () => rej(path);
          script.type = 'text/javascript';
          script.src = path;

          document.head.appendChild(script);
        });

        await promise;
        Add.debug(`скрипт ${path} загружен!`);
      }
    }
    catch(err) {
      return this.error(err, ERROR.NOFILE);
    }
    return true;
  },

  /**
   * Выводит ошибку в консоли
   * 
   * @param  {string} msg Текст ошибки
   * @param  {number} [code=0] Код ошибки
   *
   * @example
   * Add.error("Файл не найден!", ERROR.NOFILE);
  */
  error: (msg, code=0) => console.error('ERROR!', msg, code),

  /**
   * @param  {function} init Выполняется только один раз
   * @param  {function} update Выполняется после init каждый тик
   * @param  {function} loading Функция экрана загрузки
   * @return {object}
   *
   * @example
   * const canvas = Add.canvas(
   * async () => {
   *  Add.debug('init');
   * },
   * 
   * t => {
   *  Add.debug('current time:', t);
   * },
   * 
   * (procent, t) => {
   *  Add.debug('loading...', procent);
   * });
   * canvas.init().then(() => canvas.update());
  */
  canvas: (init, update, loading) => {
    let canvas = document.getElementById(cfg.window.id);

    /**
     * Возвращает ширину и высоту в соответствии с настройками в cfg
     * 
     * @return {array} [width, height]
    */
    const funcGetCanvasSize = () => {
      let {width, height} = cfg.window;
      if (cfg.window.fullscreen) [width, height] = [window.innerWidth, window.innerHeight];
      if (cfg.pixel > 1) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        [width, height] = [width * cfg.pixel, height * cfg.pixel];
        cfg.zoom = cfg.pixel;
      }
      return [width, height];
    }

    /**
     * Проверяет нажатие клавиш
     * 
     * @param  {object} e Объект события
    */
    const funcKeyChecker = e => {
      if (modules.audio) {
        audio.context.resume();
        Eng.focus(true);
      }
      if (!bind) return false;
      if (bind.check('textbox')) return false;

      const code = e.code.toLowerCase().replace('key', '');

      e.preventDefault();
      e.stopImmediatePropagation();

      if (code in keylocks)
        bind[e.type == 'keydown' ? 'add' : 'clear'](keylocks[code]);
    }

    /**
     * Проверяет события мышки или тачскрина
     * 
     * @param  {object} e Объект события
    */
    const funcMouseChecker = e => {
      const isTouch = ~['touchstart', 'touchend', 'touchmove'].indexOf(e.type);

      const xoff = isTouch ? e.changedTouches[0].clientX : e.offsetX,
            yoff = isTouch ? e.changedTouches[0].clientY : e.offsetY;

      mouse.x = cameraes[current_camera].x + xoff * cfg.pixel;
      mouse.y = cameraes[current_camera].y + yoff * cfg.pixel;
      if (isTouch) {
        is_touch = true;
        mouse.touch = {
          x: xoff,
          y: yoff
        }
      }
      if (!bind) return false;

      e.preventDefault();
      e.stopImmediatePropagation();

      if (modules.audio && !~['touchmove', 'mousemove'].indexOf(e.type)) {
        modules.audio.context.resume();
        Eng.focus(true);
      }

      switch(e.type) {
        case 'mouseup':
          case 'touchend':
            is_touch = false;
            bind.add('uclick');
            canvas.focus();
        break;
        case 'mousedown':
          case 'touchstart':
            bind.add('dclick');
        break;
      }
    }

    /** Функция выполняется при изменении окна */
    const funcResize = () => {
      [canvas.width, canvas.height] = funcGetCanvasSize();

      cvs = canvas.getContext('2d');

      cvs.imageSmoothingEnabled = cfg.smooth || false;
      if (cfg.smooth)
        canvas.imageSmoothingQuality = 'high';
      canvas.style['image-rendering'] = cfg.smooth ? 'smooth' : 'pixelated';
      canvas.style['font-smooth'] = cfg.smooth ? 'always' : 'never';

    }

    /** Устанавливает события и отключает аудиоплеер */
    const funcReady = () => {
      addEventListener('keydown', funcKeyChecker, false);
      addEventListener('keyup', funcKeyChecker, false);
      addEventListener('contextmenu', e => e.preventDefault(), false);
      addEventListener('resize', funcResize, false);

      for (const event of [
        'mousedown', 'mouseup', 'mousemove',
        'touchstart', 'touchend', 'touchmove'
      ]) addEventListener(event, funcMouseChecker, false);

      if (modules.audio) Eng.focus(true);
      if (!'mediaSession' in navigator) return false;

      navigator.mediaSession.setActionHandler('play', () => { })
      navigator.mediaSession.setActionHandler('pause', () => { })
      navigator.mediaSession.setActionHandler('seekbackward', () => { })
      navigator.mediaSession.setActionHandler('seekforward', () => { })
      navigator.mediaSession.setActionHandler('previoustrack', () => { })
      navigator.mediaSession.setActionHandler('nexttrack', () => { })
    }

    /**
     * Функция которая обрабатывает все объекты и GUI
     * 
     * @param  {number} t Кол-во секунд с запуска
    */
    const funcUpdate = t => {
      current_time = t;

      if (loaded == mloaded) {
        cvs.save();
          cvs.scale(cfg.zoom, cfg.zoom);
          cvs.translate(-cameraes[current_camera].x / cfg.zoom, -cameraes[current_camera].y / cfg.zoom);
          update(current_time);
          for (const id of Object.keys(objects)
            .sort((a, b) => (objects[a].yr || objects[a].y) - (objects[b].yr || objects[b].y))) {
            
            const obj = objects[id];
            if (!obj) continue;
            if (!editor && !obj.is_create && obj.create) {
              obj.create();
              obj.is_create = true;
            }
            if (!pause && obj.update) obj.update(current_time);
            if (obj.draw) obj.draw(cvs);
          }
        cvs.restore();
        gui.reverse().forEach(e => e(cvs));
      } else loading(loaded / mloaded, current_time);
      gui = [];

      if (!bind) {
        if (modules.byte) {
          let arr = [];
          for (key in keylocks) arr.push(keylocks[key]);
          arr.push('uclick', 'dclick', 'hover', 'textbox');
          bind = new Byte(...arr);
        }
      } else {
        canvas.style.cursor = bind.check('hover') ? 'pointer' : 'default';
        bind.clear('hover', 'dclick', 'uclick');
      }

      window.requestAnimationFrame(funcUpdate);
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = cfg.window.id;
      [canvas.width, canvas.height] = funcGetCanvasSize();
      document.body.appendChild(canvas);
    }

    let cvs;
    funcResize();
    
    Eng.console();
    funcReady();
    return {
      id: canvas, cvs: cvs,
      init: init, update: funcUpdate,
    }
  },

  /**
   * Добавляет объект
   * 
   * @param  {string|object} obj Шаблон объекта или сам объект
   * @param  {number} [x=0] X
   * @param  {number} [y=0] Y
   * @param  {number} [nid=false] ID объекта, по умолчанию генерируется через End.id()
   * @return {Obj}
   *
   * @example
   * let obj = Add.object('player', 50, 50);
   * obj.yr += 8;
  */
  object: (obj, x=0, y=0, nid=false) => {
    if (typeof(obj) == 'string') obj = templates[obj];
    let id = nid || Eng.id(); 
    objects[id] = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
    objects[id].x = x;
    objects[id].y = y;
    objects[id].id = id;
    return objects[id];
  },

  /**
   * Добавляет функционал для отрисовки поверх всех игровых объектов
   * 
   * @param  {function} func Функция для отрисовки
   *
   * @example
   * Add.gui(cvs => {
   *  cvs.fillStyle = '#fff';
   *  cvs.fillText("Hello world", 10, 10);
   * });
  */
  gui: func => gui.push(func),

  /**
   * Выводит в консоль информацию только при включенном cfg.debug
   * 
   * @param  {any} arg Информация, можно перечислять через запятую
   *
   * @example
   * Add.debug("hello world", {x: 5, y: 10}, cfg.build.v);
  */
	debug: function(arg) { if (cfg.debug) console.log('[DEBUG!]', ...arguments); },

  /**
   * Загружает модули из папки по умолчанию (cfg.modulepath)
   * @param {string[]} arguments Название модуля, можно без .js
   *
   * @example
   * Add.module('byte', 'search.js');
  */
  module: async function() {
    try {
      for (let i = 0; i < arguments.length; i++) {
        mloaded++;
        let name = arguments[i], script = document.createElement('script'), promise = new Promise((res, rej) => {
          script.onload = function() {
            let source = name.split('.js')[0].split('/').slice(-1)[0];
            loaded++;
            window[source] = modules[source];
            Add.debug(`added: ${source} module!`);
            res(true);
          }
          script.onerror = function() { rej(name); }
        });
        script.type = 'text/javascript';
        script.src = `${cfg.modulepath}${name}.js`;
        document.head.appendChild(script);
        await promise;
      }
    } catch(err) { return this.error(err, ERROR.NOFILE); }
  },

  /**
   * Функция для тестирования время работы функций
   * 
   * @param  {function} func Функция для теста
   * @return {bool}
   *
   * @example
   * Add.test(() => {
   *  let sum = 0;
   *  for (let i = 0; i < 100000; i++) sum += i ** 2;
   *  Add.debug('result', sum);
   * });
  */
  test: async func => {
    let date = Date.now();
    try {
      await func();
      Add.debug('function is done!', `${(Date.now() - date) / 1000}s`);
      return true;
    }
    catch (err) {
      Add.error(err, 0);
      Add.debug('timeout', `${(Date.now() - date) / 1000}s`);
      return false;
    }
  }
}

/**
 * Класс для объектов
 * @constructor
*/
class Obj {
  /**
   * @param  {string} [name=undefined] Название для объектов
   * @param  {function} create Функция при создании объекта
   * @param  {update} update Функция для обработки данных (зависит от pause)
   * @param  {draw} draw Функция рисования
   * @return {Obj}
  */
  constructor(name='undefined', create, update, draw) {
    this.name = name;
    this.x = this.y = this.image_index = 0;
    this.create = create;
    this.update = update;
    this.draw = draw;
    templates[name] = this;
  }

  /**
   * Функция уничтожения объекта
   * 
   * @return {bool}
  */
  destroy() {
    if (this.delete) {
      while(!this.delete());
      delete objects[this.id];
      return true;
    } else {
      delete objects[this.id];
      return true;
    }
  }
}

/**
 * Класс для модулей
 * @constructor
*/
class Module {
  /**
   * @param  {string} id Название модуля
   * @param  {string} [v=1.0] Версия модуля
  */
  constructor(id, v='1.0') {
    this.id = id;
    this.v = v;
    modules[this.id] = this;
  }
}
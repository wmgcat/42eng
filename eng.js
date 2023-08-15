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
};

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
 * @property {number} [window.fps=60] Максимальное кол-во кадров в секунду, если -1, то ограничений нет
 * @property {string} [modulepath=./modules/] Путь до папки с модулями
 * @property {string} datapath Обрезание путей, для сокращения названий
 * @property {bool} [sort=true] Режим сортировки
 * @property {bool} [smooth=false] Режим сглаживания
 * @property {number} [pixel=window.devicePixelRatio] Пиксель
 * @property {object} loading Экран загрузки
 * @property {string} [loading.background=#1e0528] Цвет фона
 * @property {string} [loading.color=#9664e6] Цвет полоски загрузки
*/
let cfg = {
  title: '42eng.js',
  author: 'wmgcat',
  debug: false,
  build: {
    v: '1.7.5.5',
    href: 'github.com/wmgcat/42eng'
  },
  grid: 32,
  zoom: 1,
  window: {
    id: 'game',
    width: 800,
    height: 600,
    fullscreen: true,
    fps: 60
  },
  modulepath: './modules/',
  datapath: '',
  sort: true,
  smooth: false,
  pixel: window.devicePixelRatio,
  loading: {
    background: '#1e0528',
    color: '#9664e6'
  }
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
    ];
    console.log(img.join('\n'));
  },

  /**
   * Проверяет есть ли модули в проекте
   * 
   * @param  {...string} args Названия модулей
   * @return {bool}
  */
  exist(...args) {
    for (const module of args)
      if (typeof(modules[module]) === 'undefined')
        return false;

    return true;
  }
};

let loaded = 0, mloaded = 0, current_time = 0, current_level = 0, current_camera = 0, delta = -1,
    deltaTime = 0;
let pause = false, editor = false, levelChange = false, is_touch = false;
let render = [], gui = [], cameraes = [{'x': 0, 'y': 0}], modules = {};
let keylocks = {}, grid = {}, levelMemory = {}, objects = [], templates = {}, images = {};
let mouse = {x: 0, y: 0, touch: {x: 0, y: 0}, display_x: 0, display_y: 0}, bind = false;
let lastFrame = window.performance.now();

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
   * @return {string}
   *
   * @example
   * Add.error("Файл не найден!", ERROR.NOFILE);
  */
  error: (msg, code=0) => {
    const str = `[CODE ${code}]: ${msg}`;
    
    console.error(str);
    return str;
  },

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
    const fpsPerSec = 1000 / cfg.window.fps;

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

      const rect = canvas.getBoundingClientRect();
      const xoff = (isTouch ? e.changedTouches[0].clientX : e.clientX) - rect.left,
            yoff = (isTouch ? e.changedTouches[0].clientY : e.clientY) - rect.top;

      mouse.x = cameraes[current_camera].x + xoff * cfg.pixel;
      mouse.y = cameraes[current_camera].y + yoff * cfg.pixel;
      mouse.display_x = xoff;
      mouse.display_y = yoff;
      if (isTouch) {
        is_touch = true;
        mouse.touch = {
          x: xoff,
          y: yoff
        }
      }
      if (!bind) return false;

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

      e.preventDefault();
      e.stopImmediatePropagation();
    }

    /** Функция выполняется при изменении окна */
    const funcResize = () => {
      funcRelease();
      [canvas.width, canvas.height] = funcGetCanvasSize();

      cvs = canvas.getContext('2d');

      cvs.imageSmoothingEnabled = cfg.smooth || false;
      if (cfg.smooth)
        canvas.imageSmoothingQuality = 'high';
      canvas.style['image-rendering'] = cfg.smooth ? 'smooth' : 'pixelated';
      canvas.style['font-smooth'] = cfg.smooth ? 'always' : 'never';
    }

    /** Очистка кеша канваса */
    const funcRelease = () => {
      [canvas.width, canvas.height] = [1, 1];
      cvs = canvas.getContext('2d');
      cvs && cvs.clearRect(0, 0, 1, 1);
    }

    /** Устанавливает события и отключает аудиоплеер */
    const funcReady = () => {
      addEventListener('keydown', funcKeyChecker, false);
      addEventListener('keyup', funcKeyChecker, false);
      addEventListener('contextmenu', e => e.preventDefault(), false);
      addEventListener('resize', funcResize, false);
      addEventListener('wheel', e => e.preventDefault(), { passive: false });

      for (const event of ['mousedown', 'mouseup', 'mousemove'])
        window[`on${event}`] = funcMouseChecker;

      for (const event of ['touchstart', 'touchend', 'touchmove'])
        canvas[`on${event}`] = funcMouseChecker;

      if (modules.audio) Eng.focus(true);
      funcResize();
    }

    /**
     * Функция которая обрабатывает все объекты и GUI
     * 
     * @param  {number} t Кол-во секунд с запуска
    */
    const funcUpdate = t => {
      window.requestAnimationFrame(funcUpdate);

      current_time++;

      const now = Date.now();
      if (delta == -1) delta = Date.now();
      deltaTime = (now - delta) / cfg.window.fps;
      delta = now;

      // обработка нажатий (требуется модуль byte):
      if (modules.byte && keylocks) {
        if (!bind) {
          const arr = [];
          for (const key in keylocks)
            arr.push(keylocks[key]);
          arr.push('uclick', 'dclick', 'hover', 'textbox');

          bind = new Byte(...arr);
        }
      }

      // экран загрузки:
      if (loaded < mloaded) {
        if (!loading) {
          cvs.fillStyle = cfg.loading.background;
          cvs.fillRect(0, 0, canvas.width, canvas.height);

          const percent = loaded / mloaded, w = canvas.width * .6;
          const x = (canvas.width - w) * .5, y = (canvas.height - cfg.grid) * .5;

          cvs.fillStyle = cvs.strokeStyle = cfg.loading.color;
          
          cvs.strokeRect(x, y, w, cfg.grid);
          cvs.fillRect(x + 2, y + 2, (w - 4) * percent, cfg.grid - 4);
        } else loading(loaded / mloaded, current_time);
      } else {
        cvs.save();
          cvs.scale(cfg.zoom, cfg.zoom);
          cvs.translate(-cameraes[current_camera].x / cfg.zoom, -cameraes[current_camera].y / cfg.zoom);

          update(deltaTime);

          // сортировка:
          if (cfg.sort && objects)
            objects = objects.filter(x => x != false).sort((a, b) => (a.yr || a.y) - (b.yr || b.y));

          // обработка всех объектов:
          for (const obj of objects) {
            if (!obj) continue;

            // совместимость со старыми версиями:
            if (obj.create && typeof(obj.create) == 'function') {
              obj.__funcCreate = obj.create;
              delete obj.create;
            }
            if (obj.update && typeof(obj.update) == 'function') {
              obj.__funcUpdate = obj.update;
              delete obj.update;
            }
            if (obj.draw && typeof(obj.draw) == 'function') {
              obj.__funcDraw = obj.draw;
              delete obj.draw;
            }

            if (!editor && !obj.__isCreate && obj.__funcCreate) {
              obj.__funcCreate();
              obj.__isCreate = true;
            }
            if (!pause && obj.__funcUpdate) obj.__funcUpdate(current_time);
            if (obj.__funcDraw) obj.__funcDraw(cvs, current_time);
          }

        cvs.restore();
        
        // отрисовка интерфейсов:
        gui.forEach(func => func(cvs));
        if (modules.particle)
          particle.draw(cvs);

        if (!bind) return;
        canvas.style.cursor = bind.check('hover') ? 'pointer' : 'default';
        bind.clear('hover', 'dclick', 'uclick');
      }
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = cfg.window.id;
      [canvas.width, canvas.height] = funcGetCanvasSize();
      document.body.appendChild(canvas);
    }

    let cvs;

    Eng.console();
    funcReady();
    return {
      id: canvas, cvs: cvs,
      init: async () => {
        if (loading)
          loading(0);
        await init();
      }, update: funcUpdate,
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
    
    let i = objects.findIndex(e => !e);
    if (~i) {
      objects[i] = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
      objects[i].x = x;
      objects[i].y = y;
      objects[i].id = id;
    } else {
      i = objects.push(Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)) - 1;
      objects[i].x = x;
      objects[i].y = y;
      objects[i].id = id;
    }


    return objects[i];
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
   * @return {string|undefined}
   *
   * @example
   * Add.debug("hello world", {x: 5, y: 10}, cfg.build.v);
  */
	debug: function(arg) {
    if (cfg.debug) {
      const str = `[DEBUG]: ${[...arguments].join(' ')}`;
      
      console.log(str);
      return str;
    }
  },

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
    this.__funcCreate = create;
    this.__funcUpdate = update;
    this.__funcDraw = draw;

    templates[name] = this;
  }

  /**
   * Функция уничтожения объекта
   * 
   * @return {bool}
  */
  destroy() {
    const i = objects.findIndex(e => e == this);
    
    if (this.delete) {
      while(!this.delete());      
      if (~i)
        objects[i] = false;

      return true;
    } else {
      if (~i)
        objects[i] = false;

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
/**
 * @file Модуль частиц
 * @author wmgcat
 * @version 1.1
*/

const particle = new Module('particle', '1.1');

cfg.particle = {
  gravity: .05, // гравитация частиц
  max: 50 // максимальное кол-во
};

/**
 * Создает частицу
 * 
 * @param  {object} props Параметры частицы
 * @param {number} x X
 * @param {number} y Y
*/
particle.create = (props, x, y) => {
  const part = Add.object('$part', x, y);

  part.data = {};
  part.listPropertyLive = [];

  for (const key of Object.keys(props)) {
    switch(key) {
      default:
        if (!props[key].random)
          part.setProperty(key, props[key].start, props[key].end, props[key].step);
        else {
          const value = ~~(Math.random() * props[key].random);
          part.setProperty(key, value, value, 0);
        }
      break;
      case 'speed': case 'gravity': case 'islive':
        part.data[key] = props[key];
        if (key == 'gravity')
          part.data.save_gravity = props[key];
      break;
      case 'image': part.data.image = props[key].copy(); break;
      case 'life':
        part.data.life = timer.create(props[key]);
      break;
      case 'yr':
        part.yr = props[key];
      break;
    }
  }
}

/**
 * Создает несколько частиц в радиусе [X:Y]
 * 
 * @param  {object} props Параметры частицы
 * @param  {number} x X
 * @param  {number} y Y
 * @param  {number} count Кол-во частиц
 * @param  {number} range Радиус создания частиц
 */
particle.emitter = function (props, x, y, count, range) {
  for (let i = 0; i < count; i++) {
    let nx = x + Math.random() * range * 2 - range, ny = y + Math.random() * range * 2 - range;
    if (modules.math && math.collision.rect(nx, ny, cameraes[current_camera].x - cfg.grid, cameraes[current_camera].y - cfg.grid, cfg.window.width + cfg.grid * 2, cfg.window.height + cfg.grid * 2))
      this.create(Eng.copy(props), nx, ny);
  }
}

// шаблон частицы:
const templateParticle = new Obj('$part',
  // создание:
  function() {
    for (const key of ['alpha', 'scale', 'angle']) {
      if (!this.data[key])
        this.setProperty(key, 1, 1, 0);
    }
    /*
      {
        image, // _Image
        isLife, // set animation to particle life
        gravity, //number
        speed, // Move speed
        life, // Timer
        alpha: { // number
          start,
          end,
          step
        },
        scale: { // number
          start,
          end,
          step
        },
        angle: { // number
          start,
          end,
          step
        }
      }
    */
  },

  // обновление:
  function() {
    if (!this.data.life || this.data.life.check()) return this.destroy();

    for (const key of this.listPropertyLive)
      this.data[key].start = math.lerp(this.data[key].start, this.data[key].end, this.data[key].step);

    if (!'angle' in this.data) return;
    this.x += Math.cos(math.torad(this.data.angle.start)) * this.data.speed;
    this.y += Math.sin(math.torad(this.data.angle.start)) * this.data.speed + (this.data.gravity || 0);

    if (!'gravity' in this.data) return;
    this.data.gravity = math.lerp(this.data.gravity, -this.data.save_gravity, cfg.particle.gravity);
  },

  // рисование:
  function(cvs) {
    if (!this.data.image) return;

    this.data.image.draw(cvs,
      this.x, this.y,
      undefined, undefined,
      this.data.alpha.start,
      this.data.scale.start, this.data.scale.start,
      this.data.angle.start
    );
  }

);

/**
 * Добавляет значение, которое будет автоматически изменяться с помощью интерполяции
 * 
 * @param {string} key Ключ
 * @param {number} [start=0] Начало
 * @param {number} [end=0] Конец
 * @param {number} [step=0] Шаг [0..1]
*/
templateParticle.setProperty = function(key, start=0, end=0, step=0) {
  this.listPropertyLive.push(key);
  this.data[key] = {
    start: start,
    end: end,
    step: step
  };
}

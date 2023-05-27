/**
 * @file Модуль частиц
 * @author wmgcat
 * @version 1.0
*/

const particle = new Module('particle', '1.0');

cfg.particle = {
  gravity: 1, // гравитация частиц
  max: 50 // максимальное кол-во
};

/**
 * @param  {[type]}
 * @return {[type]}
*/
particle.create = props => {

}

particle.emitter = (props, x, y, count) => {

}


const templateParticle = new Obj('$part',

  function() {
    this.data = {};
    this.listPropertyLive = [];
    /*
      {
        image, // _Image
        frame, // -1 - random
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

  function() {
    if (!this.data.life || this.data.life.check()) return this.destroy();

    for (const key of this.listPropertyLive)
      this.data[key].start = math.lerp(this.data[key].start, this.data[key].end, this.data[key].step);

    if (!'angle' in this.data) return;
    this.x += Math.cos(math.torad(this.data.angle.start)) * this.data.speed;
    this.y += Math.sin(math.torad(this.data.angle.start)) * this.data.speed + (this.data.gravity || 0);

    if (!'gravity' in this.data) return;
    this.data.gravity = math.lerp(this.data.gravity, 0, cfg.particle.gravity);
  },

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

/*let templateParticle = new Obj('$part');

cfg.maxparticles = 50;

templateParticle.update = function() {
  let delta = 1;
  if (this.life) delta -= this.life.delta();
  else delta -= this.image_index.current_frame / this.image_index.frames;
  this.x += Math.cos(math.torad(this.angle)) * (this.speed || 0);
  this.y += Math.sin(math.torad(this.angle)) * (this.speed || 0);
  this.scale = this.scale_start + (this.scale_end - this.scale_start) * delta;
  this.alpha = this.alpha_start + (this.alpha_end - this.alpha_start) * delta;
  if ((this.life && this.life.check(true)) || (!this.life && this.image_index.current_frame >= (this.image_index.frames - this.image_index.speed))) this.destroy();
}
templateParticle.draw = function(cvs) { if (this.scale > 0) this.image_index.draw(cvs, this.x, this.y, undefined, undefined, this.alpha, this.scale, this.scale, this.angle); }

modules.particle = {
  title: 'particle', v: '1.0',
  create: (params, x, y, gui) => {
    if (modules.search && ((modules.search.count('$part') + 1) <= cfg.maxparticles)) {
      let pt = Add.object(templateParticle, x, y);
      pt.gui = gui;
      Object.keys(params).forEach(key => {
        switch(key) {
          default: pt[key] = params[key]; break;
          case 'image': pt.image_index = params[key].copy(); break;
          case 'current_frame':
            if (pt.image_index)
              pt.image_index[key] = params[key];
          break;
          case 'is_randomize':
            if (pt.image_index)
              pt.image_index.current_frame = ~~(Math.random() * pt.image_index.frames);
          break;
          case 'life':
            pt.life = timer.create(params[key]);
            pt.life.check(); 
          break;
        }
      });
      if (pt.angle == -1 || pt.angle == undefined) pt.angle = Math.random() * ((pt.angle_end || 0) - (pt.angle_start || 0)) - (pt.angle_end || 0);
      if (pt.alpha == undefined) pt.alpha = pt.alpha_start || pt.alpha_end || 1;
      if (pt.alpha_end == undefined) pt.alpha_end = pt.alpha_start || pt.alpha;
      if (pt.alpha_start == undefined) pt.alpha_start = pt.alpha;
      if (pt.scale == undefined) pt.scale = pt.scale_start || pt.scale_end || 1;
      if (pt.scale_end == undefined) pt.scale_end = pt.scale_start || pt.scale;
      if (pt.scale_start == undefined) pt.scale_start = pt.scale;  
      return pt;
    }
  }
}

Add.emitter = (params, x, y, count, range, gui) => {
  for (let i = 0; i < count; i++) {
    let nx = x + Math.random() * range * 2 - range, ny = y + Math.random() * range * 2 - range;
    if (modules.math && math.collision.rect(nx, ny, cameraes[current_camera].x - cfg.grid, cameraes[current_camera].y - cfg.grid, cfg.window.width + cfg.grid * 2, cfg.window.height + cfg.grid * 2)) modules.particle.create(params, nx, ny, gui);
  }
}
*/

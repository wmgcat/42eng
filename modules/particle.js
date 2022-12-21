let templateParticle = new Obj('$part');

templateParticle.update = function() {
  let delta = 1;
  if (this.life) delta -= this.life.delta();
  else delta -= this.image_index.frame / this.image_index.count;
  this.x += Math.cos(math.torad(this.angle)) * (this.spd || 0);
  this.y += Math.sin(math.torad(this.angle)) * (this.spd || 0);
  this.scale = this.scale_start + (this.scale_end - this.scale_start) * delta;
  this.alpha = this.alpha_start + (this.alpha_end - this.alpha_start) * delta;
  if ((this.life && this.life.check(true)) || (!this.life && this.image_index.frame >= (this.image_index.count - this.image_index.frame_spd))) this.destroy();
}
templateParticle.draw = function(cvs) { this.image_index.draw(cvs, this.x, this.y, undefined, undefined, this.alpha, this.scale, this.scale, this.angle); }

modules.particle = {
  title: 'particle', v: '1.0',
  create: (params, x, y, gui) => {
    let pt = Add.object(templateParticle, x, y);
    pt.gui = gui;
    Object.keys(params).forEach(key => {
      switch(key) {
        default: pt[key] = params[key]; break;
        case 'image': {
          let img = params[key];
          pt.image_index = image.init(img.path, img.left, img.top, img.w, img.h, img.xoff, img.yoff, img.count);
        } break;
        case 'frame_spd': case 'frame':
          if (pt.image_index)
            pt.image_index[key] = params[key];
        break;
        case 'is_randomize':
          if (pt.image_index)
            pt.image_index.frame = ~~(Math.random() * pt.image_index.count);
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

Add.emitter = (params, x, y, count, range, gui) => {
  for (let i = 0; i < count; i++) {
    let nx = x + Math.random() * range * 2 - range, ny = y + Math.random() * range * 2 - range;
    if (collision.rect(nx, ny, cameraes[current_camera].x - cfg.grid, cameraes[current_camera].y - cfg.grid, cfg.window.width + cfg.grid * 2, cfg.window.height + cfg.grid * 2)) modules.particle.create(params, nx, ny, gui);
  }
}

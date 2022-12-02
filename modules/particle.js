modules.particle = {
  title: 'particle', v: '1.0',
  create: (params, x, y, gui) => {
    let pt = Add.object({
      name: '$part', unsave: true,
      gui: gui
    }, x, y);
    Object.keys(params).forEach(key => {
      switch(key) {
        default: pt[key] = params[key]; break;
        case 'image_index': {
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
          pt.life = timer.init(params[key]);
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
    pt.func = cvs => {
      let is_update = true;
      if ((pt.life && pt.life.check(true)) || (!pt.life && pt.image_index.frame >= (pt.image_index.count - pt.image_index.frame_spd))) {
        is_update = false;
        pt.destroy();
      }
      if (is_update) {
        let delta = 1;
        if (pt.life) delta -= pt.life.delta();
        else delta -= pt.image_index.frame / pt.image_index.count; 
        pt.x += Math.cos(Eng.math.torad(pt.angle)) * (pt.spd || 0);
        pt.y += Math.sin(Eng.math.torad(pt.angle)) * (pt.spd || 0);
        pt.scale = pt.scale_start + (pt.scale_end - pt.scale_start) * delta;
        pt.alpha = pt.alpha_start + (pt.alpha_end - pt.alpha_start) * delta;
        pt.image_index.draw(cvs, pt.x, pt.y, undefined, undefined, pt.alpha, pt.scale, pt.scale, pt.angle);
      }	
		}
		pt.draw = () => {
			if (!pt.gui) render[render.length] = { 'obj': pt, 'func': pt.func};
			else Add.gui(cvs => { pt.func(pt.gui)} );
		}
		pt.destroy = () => {
			pt.DELETED = true;
			if (pt.delete) pt.delete();
			return true;
		}
    return pt;
  }
}

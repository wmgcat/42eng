modules.image = {
  title: 'image', v: '1.0',
  init: function(path, left, top, w, h, xoff, yoff, count) {
    modules.image.path = path, modules.image.image = images[path], modules.image.left = left || 0,
    modules.image.top = top || 0, modules.image.w = w || (modules.image.image.width || 0), modules.image.h = h || modules.image.height,
    modules.image.count = count || 1, modules.image.xoff = xoff || 0, modules.image.yoff = yoff || 0, modules.image.frame = 0, modules.image.frame_spd = 0;
    return Eng.copy(modules.image);
  },
  draw: function(cvs, x, y, w, h, alpha, xscale, yscale, rotate) {
    try {
      if (this.image) {
        cvs.save();
          if (alpha != undefined) cvs.globalAlpha = alpha;
          let nxoff = ((w || this.w) / this.w) * this.xoff, nyoff = ((h || this.h) / this.h) * this.yoff;
          cvs.translate((x || 0) - nxoff * (xscale || 1), (y || 0) - nyoff * (yscale || 1));
          if (xscale != undefined || yscale != undefined) cvs.scale(xscale || 1, yscale || 1);
          if (rotate != undefined) {
            cvs.translate(nxoff, nyoff);
            cvs.rotate(rotate / 180 * Math.PI);
            cvs.translate(-nxoff, -nyoff);
          }
          cvs.drawImage(this.image, this.left + this.w * Math.floor(this.frame % ((this.image.width || 0) / this.w)), this.top + this.h * Math.floor(this.frame / ((this.image.width || 0) / this.w)), this.w, this.h, 0, 0, w || this.w, h || this.h);
          cvs.globalAlpha = 1;
        cvs.restore();
        this.frame = (this.frame + this.frame_spd) % this.count;

      } else this.image = images[this.path];
    } catch(err) { this.init(this.path, this.left, this.top, this.w, this.h, this.xoff, this.yoff, this.count); }
  }
}

Add.image = function(source) {
  for (let i = 0; i < arguments.length; i++) {
    mloaded++;
    let str = arguments[i];
    let img = new Image(), path = arguments[i].split('/');
    img.src = arguments[i];
    if (path[0] == '.') path = path.splice(1, path.length - 1);
    path[path.length - 1] = path[path.length - 1].replace('.png', '').replace('.jpg', '').replace('.gif', '').replace('.jpeg', '');
    img.onload = () => { loaded++; }
    img.onerror = () => { return Add.error(path + ' not find!'); }
    images[path.join('.')] = img;
    if (arguments.length <= 1) return path.join('.');
  }
}

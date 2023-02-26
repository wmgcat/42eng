modules.image = {
  title: 'image', v: '1.0',
  create: function(path, left, top, w, h, xoff, yoff, count) {
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
          let left = (this.left + this.w * ~~this.frame) % this.image.width, top = this.top + ~~((this.left + this.w * ~~this.frame) / this.image.width) * this.h;
          cvs.drawImage(this.image, left, top, this.w, this.h, 0, 0, w || this.w, h || this.h);
          cvs.globalAlpha = 1;
        cvs.restore();
        this.frame = (this.frame + this.frame_spd) % this.count;

      } else this.image = images[this.path];
    } catch(err) { this.create(this.path, this.left, this.top, this.w, this.h, this.xoff, this.yoff, this.count); }
  }
}

Add.image = async function(args) {
  for (let i = 0; i < arguments.length; i++) {
    try {
      mloaded++;
      let str = arguments[i], img = new Image(),
          path = str.split('/'), promise = new Promise((res, rej) => {
        img.onload = () => {
          if (path[0] == '.') path = path.splice(1, path.length - 1);
          path[path.length - 1] = path[path.length - 1].replace('.png', '').replace('.jpg', '').replace('.gif', '').replace('.jpeg', '');
          images[path.join('.')] = img;
          loaded++;
          res(path.join('.'));
        }
        img.onerror = () => { rej(str); }
      });
      img.src = str;
      let state = await promise;
      if (arguments.length == 1) return state;
    } catch(err) { Add.error(err, ERROR.NOFILE); }
  }
}

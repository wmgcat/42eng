modules.image = {
  title: 'image', v: '1.1',
  create: function(path, left, top, w, h, xoff, yoff, count, speed) {
    return new _Image(path, left, top, w, h, xoff, yoff, count, speed);
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

class _Image {
  constructor(source, left, top, w, h, xoff=0, yoff=0, frames=1, speed=1) {
    let image = images[source];
    if (image) {
      this.left = left, this.top = top, this.w = w || image.width,
      this.h = h || image.height, this.xoff = xoff, this.yoff = yoff,
      this.frames = frames, this.speed = speed, this.current_frame = 0,
      this.image = image;
    }
  }
  draw(cvs, x, y, w, h, alpha=1, xscale=1, yscale=1, rotate=0) { 
    if (this.frames > 1) this.current_frame = (this.current_frame + this.speed) % this.frames;
    cvs.save();
      let nxoff = ((w || this.w) / this.w) * this.xoff, nyoff = ((h || this.h) / this.h) * this.yoff;
      cvs.translate((x || 0) - nxoff * (xscale || 1), (y || 0) - nyoff * (yscale || 1));
      if (xscale != undefined || yscale != undefined) cvs.scale(xscale || 1, yscale || 1);
      if (rotate != undefined) {
        cvs.translate(nxoff, nyoff);
        cvs.rotate(rotate / 180 * Math.PI);
        cvs.translate(-nxoff, -nyoff);
      }
      cvs.globalAlpha = alpha;
      let left = (this.left + this.w * ~~this.current_frame) % this.image.width, top = this.top + ~~((this.left + this.w * ~~this.current_frame) / this.image.width) * this.h;
      cvs.drawImage(this.image, left, top, this.w, this.h, 0, 0, w || this.w, h || this.h);
      cvs.globalAlpha = 1;
    cvs.restore();
  }
}

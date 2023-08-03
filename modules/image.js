/**
 * @file Модуль изображений
 * @author wmgcat
 * @version 1.2
*/

/**
 * Модуль изображений
 * @namespace
*/
const image = new Module('image', '1.3');

/**
 * Добавляет объект _Image, который можно использовать для отрисовки
 * 
 * @param  {string|_Image} id ID изображения или объект класса _Image
 * @param {number} [left=0] Левый отступ
 * @param {number} [top=0] Верхний отступ
 * @param {number} [w=path.width] Ширина
 * @param {number} [h=path.height] Высота
 * @param {number} [xoff=0] Горизонтальный центр изображения
 * @param {number} [yoff=0] Вертикальный центр изображения
 * @param {number} [frames=1] Кол-во кадров
 * @param {number} [speed=1] Скорость анимации
 * 
 * @return {_Image}
*/
image.create = (id, left, top, w, h, xoff, yoff, frames, speed) => (
  new _Image(id, left, top, w, h, xoff, yoff, frames, speed)
);

/**
 * Возвращает DataURL
 *
 * @param {string} id Ключ к изображению
 * @return {string}
*/
image.getDataURL = id => {
  const _canvas = document.createElement('canvas'),
        _cvs = _canvas.getContext('2d');

  _canvas.height = images[id].naturalHeight;
  _canvas.width = images[id].naturalWidth;

  _cvs.drawImage(images[id], 0, 0);

  return _canvas.toDataURL('image/png');
}

/**
 * Добавляет изображения в объект image
 * 
 * @param  {string|array} path Путь к файлу изображения, можно указывать несколько
 * @return {string}
*/
Add.image = async function(...args) {
  try {
    let id;
    for (const path of args) {
      mloaded++;
      const promise = new Promise((res, rej) => {
        const img = new Image();
        img.src = path;

        img.onload = () => {
          let id = path.split('/');

          if (id[0] == '.') id = id.splice(1, id.length - 1);
          if (id[0] == cfg.datapath) id = id.splice(1, id.length - 1);

          for (const ext of ['png', 'jpeg', 'jpg', 'gif'])
            id[id.length - 1] = id[id.length - 1].replace(`.${ext}`, '');

          id = id.join('.');
          
          images[id] = img;
          loaded++;
          res(id);
        }
        img.onerror = err => rej(err);

      });
      id = await promise;
    }
    return id;
  } catch(err) { return this.error(err, ERROR.NOFILE); }
}

/**
 * Загружает изображение по URL
 * 
 * @param  {string} id Ключ по которому будет храниться изображение
 * @param  {string} url Ссылка на изображение
 * @return {string}
*/
Add.imageURL = async function(id, url) {
  mloaded++;
  const promise = new Promise((res, rej) => {
    images[id] = new Image();
    images[id].src = url;
    images[id].onload = () => {
      loaded++;
      res(id);
    }
    images[id].onerror = err => rej(err);
  });
  try {
    const str = await promise;
    return str;
  }
  catch(err) { return this.error(err, ERROR.NOFILE); }
}

/**
 * Класс для картинок
 * @constructor
*/
class _Image {
  /**
   * @param  {string|_Image} id ID изображения или объект класса _Image
   * @param  {number} [left=0] Левый отступ
   * @param  {number} [top=0] Верхний отступ
   * @param  {number} [w=source.width] Ширина
   * @param  {number} [h=source.height] Высота
   * @param  {number} [xoff=0] Горизонтальный центр изображения
   * @param  {number} [yoff=0] Вертикальный центр изображения
   * @param  {number} [frames=1] Кол-во кадров
   * @param  {number} [speed=1] Скорость анимации
  */
  constructor(id, left=0, top=0, w, h,
              xoff=0, yoff=0, frames=1, speed=1) {
    let image;
    if (id instanceof _Image) {
      image = id;
      this.path = image.path;
      this.reference = true;
    } else {
      image = id;
      if (images[id]) image = images[id];
      this.path = id;
    }
    if (!image) return;

    this.left = left;
    this.top = top;
    this.w = w || image.w || image.width;
    this.h = h || image.h || image.height
    this.xoff = xoff;
    this.yoff = yoff;
    this.frames = frames;
    this.speed = speed;
    this.current_frame = 0;
    this.image = image;
  }

  /**
   * Рисование картинки
   * 
   * @param  {object} cvs Объект рисования
   * @param  {number} x X
   * @param  {number} y Y
   * @param  {number} w Ширина
   * @param  {number} h Высота
   * @param  {number} [alpha=1] Прозрачность
   * @param  {number} [xscale=1] Увеличение по X
   * @param  {number} [yscale=1] Увеличение по Y
   * @param  {number} [rotate=0] Поворот
  */
  draw(cvs, x, y, w, h, alpha=1, xscale=1, yscale=1, rotate=0) {
    if (!this.image || !xscale || !yscale || !alpha || !cvs) return;

    const nw = w || this.w, nh = h || this.h,
          xoff = nw / this.w * this.xoff, yoff = nh / this.h * this.yoff;

    cvs.save();
      if (alpha != 1) cvs.globalAlpha = alpha;

      cvs.translate(x - xoff * xscale, y - yoff * yscale);
      cvs.scale(xscale, yscale);

      if (rotate && modules.math) {
        cvs.translate(xoff, yoff);
        cvs.rotate(math.torad(rotate));
        cvs.translate(-xoff, -yoff);
      }

      let left = 0, top = 0, img = this.image,
          source_w = this.image.width;

      if (this.reference) {
        img = images[this.path];
        left = this.image.left;
        top = this.image.top;
        source_w = this.image.w;
      }

      left += (this.left + this.w * ~~this.current_frame) % source_w;
      top += this.top + ~~((this.left + this.w * ~~this.current_frame) / source_w) * this.h;

      cvs.drawImage(img, left, top, this.w, this.h, 0, 0, nw, nh);

      if (alpha != 1) cvs.globalAlpha = 1;
    cvs.restore();

    if (this.frames > 1) this.current_frame = (this.current_frame + this.speed * deltaTime) % this.frames;
  }

  /**
   * Возвращает новую копию картинки
   * 
   * @return {_Image}
  */
  copy() {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
  }
}
/**
 * Паттерн
 * @type {Pattern}
 * @memberof graphics
*/


export class Pattern {
  /**
   * @param {object} cvs Основной контекст
   * @param {_Image} image Объект класса _Image
   * @param {string} repeat Режим повтора
   *
   * @example
   * const grass = new Pattern(canvas.cvs, image.grass, repeat='repeat-x');
   * graphics.rect(0, 0, 32, 32, grass.pattern, 1);
  */
  constructor(image) {
    this.canvas = document.createElement('canvas');
    this.context2d = this.canvas.getContext('2d');

    

    this.image = image;
    this.canvas.width = this.image.w;
    this.canvas.height = this.image.h;

    this.context2d.imageSmoothingEnabled = false;
    this.canvas.style['image-rendering'] = 'pixelated';
    this.canvas.style['font-smooth'] = 'never';
  }

  /**
   * Обновление паттерна (нужно для анимаций)
   * 
   * @param  {object} cvs Основной контекст
  */
  update(cvs) {
    //this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //this.image.draw(this.context2d, this.image.xoff, this.image.yoff);
    //this.pattern = cvs.createPattern(this.canvas, this.repeat);
  }

  get pattern() {
    if (!this.image.loaded) return null;
    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.image.draw(this.context2d, this.image.xoff, this.image.yoff);
    return this.canvas;
    /*if (!this._pattern) {
      this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.image.draw(this.context2d, this.image.xoff, this.image.yoff);
      this._pattern = this.source.createPattern(this.canvas, this.repeat);
    }
    return this._pattern;*/
  }
}
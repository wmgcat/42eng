/**
 * @file Основной функционал движка
 * @author wmgcat
*/

import { Byte } from './modules/byte.js';
import { Graphics } from './modules/graphics/main.js';

export class Game {
  constructor(id, params={}) {
    this.config = {
      title: params.title || '42eng', author: params.author || 'wmgcat',
      debug: params.debug || false,
      build: {
        v: '1.8',
        href: 'https://github.com/wmgcat/42eng'
      },
      window: {
        id: id,
        width: params.width || 800, height: params.height || 600,
        fullscreen: params.fullscreen || false,
        fps: params.fps || 60
      },
      smooth: params.smooth || false
    }
    
    this._loading = 0;
    this._maxloading = 0;
    this.current_time = 0;
    this.delta = Date.now();
    this.deltatime = 0;
    this.pause = false;
    this.focus = false;
    this.resized = false;
    this.canvasID = document.getElementById(id);
    this.mouse = {
      x: 0, y: 0,
      event: new Byte('uclick', 'dclick', 'hover', 'wheelup', 'wheeldown')
    }

    if (!this.canvasID) throw Error(`Канвас ${id} не найден!`);
    
    window.onload = () => {
      this.resize();
      this.graphics = new Graphics(this.canvasID, this.config.smooth);
    }
    this.resize();
    this.graphics = new Graphics(this.canvasID, this.config.smooth);

    this.events = [];
    this.listenEvents();
    this.canvasID.focus();
  }

  get loading() { return this._loading / this._maxloading; }
  set loading(x) { this._maxloading += x; }

  /** Выводит информацию о проекте */
  info() {
    console.info(`Движок: 42eng (v${this.config.build.v})\n${this.config.build.href}`);
  }

  resize() {
    this.resized = true;
    const pixel = window.devicePixelRatio;

    if (this.config.window.fullscreen) {
      this.canvasID.style.width = `${window.innerWidth}px`;
      this.canvasID.style.height = `${window.innerHeight}px`;
      this.canvasID.width = window.innerWidth * pixel;
      this.canvasID.height = window.innerHeight * pixel;
      return;
    }
    this.canvasID.width = this.config.window.width * pixel;
    this.canvasID.height = this.config.window.height * pixel;
    this.canvasID.style.width = `${this.config.window.width}px`;
    this.canvasID.style.height = `${this.config.window.height}px`;
  }

  addEvent(control) {
    this.events.push(control);
    this.listenEvents();
  }

  listenEvents() {
    for (const control of this.events)
      control.event();
    window.onresize = () => {
      this.resize();
      this.graphics.reset();
    }
    
    const getMousePosition = event => {
      const pixel = window.devicePixelRatio;
      const rect = this.canvasID.getBoundingClientRect();
      this.mouse.x = event.clientX * pixel - rect.left;
      this.mouse.y = event.clientY * pixel - rect.top;
    }, getTouchPosition = event => {
      const pixel = window.devicePixelRatio;
      const rect = this.canvasID.getBoundingClientRect();
      this.mouse.x = event.changedTouches[0].clientX * pixel - rect.left;
      this.mouse.y = event.changedTouches[0].clientY * pixel - rect.top;
    }

    window.onmouseup = window.onmousedown = window.ontouchstart = window.ontouchend = e => {
      if (e.type == 'touchstart' || e.type == 'touchend') {
        getTouchPosition(e);
        this.mouse.event.add((e.type == 'touchend') ? 'uclick' : 'dclick');
        this.canvasID.focus();
      } else {
        if (e.button == 0) {
          getMousePosition(e);
          this.mouse.event.add((e.type == 'mouseup') ? 'uclick' : 'dclick');
        }
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    
    window.onmousemove = getMousePosition;
    window.ontouchmove = getTouchPosition;

    this.canvasID.onwheel = e => e.preventDefault();
    this.canvasID.oncontextmenu = e => e.preventDefault();

    this.canvasID.onclick = e => {
      this.canvasID.focus();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  update(draw) {
    const _update = () => {
      const timenow = Date.now(),
            deltatime = (timenow - this.delta) / this.config.window.fps;
      this.deltatime = deltatime;

      if (this.graphics) {
        let ratio = this.graphics.w;
        if (ratio > this.graphics.h) ratio = this.graphics.h;

        if (this.loading < 1) {
          this.graphics.rect(0, 0, this.graphics.w, this.graphics.h, '#000');
          this.graphics.text._size = ratio * (.1 + Math.sin(this.current_time * .25) * .025);
          this.graphics.text.draw(`${~~(this.loading * 100)}%`, this.graphics.w * .5, this.graphics.h * .5, '#fff', 'fill', 'cm');
          this.graphics.round((this.graphics.w - ratio * .5) * .5, this.graphics.h * .5 + ratio * .15, ratio * .5 * this.loading, ratio * .025, ratio * .01, '#fff');
        } else
          draw(deltatime, this.graphics, ratio);
      }

      this.delta = timenow;
      this.current_time += deltatime;

      this.canvasID.style.cursor = this.mouse.event.check('hover') ? 'pointer' : 'none';
      if (this.mouse.event.key)
        this.mouse.event.clear();

      this.requestAnimationFrame(_update);
    }
    _update();
  }

  requestAnimationFrame(func) {
    (window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame || function(res) {
      window.setTimeout(res, 1000 / this.config.window.fps);
    })(func);
  }
}
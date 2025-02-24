/**
 * @file Основной функционал движка
 * @author wmgcat
*/

import { Byte } from './modules/byte.js';
import { Graphics } from './modules/graphics/main.js';
import * as LoadingScreen from './src/loadingScreen.js';

export class Game {
  constructor(id, params={}) {
    this.config = {
      title: params.title || '42eng', author: params.author || 'wmgcat',
      debug: params.debug || false,
      build: {
        v: '1.9.1',
        href: 'https://github.com/wmgcat/42eng'
      },
      window: {
        id: id,
        hideCursor: params.hideCursor || false
      },
      smooth: params.smooth || false,
      happytimer: params.happytimer || 15,
      multitab: params.multitab || false,
      ignoreScroll: params.ignoreScroll || false
    }

    this.current_time = 0;
    this.delta = performance.now();
    this.deltatime = 0;
    this.pause = false;
    this.focus = false;
    this.resized = false;
    this.canvasID = document.getElementById(id);
    this.loaded = false;
    this.ratio = 0;

    this.mouse = {
      x: 0, y: 0,
      event: new Byte('uclick', 'dclick', 'hover', 'wheelup', 'wheeldown')
    }

    if (this.config.multitab && typeof(BroadcastChannel) != 'undefined') {
      this.multitab = new BroadcastChannel(`${this.config.title}-multitab`);
      this.multitab.postMessage('new');
      this.multitab.onmessage = _ => { this.event('newtab'); }
    }


    if (!this.canvasID) throw Error(`Канвас ${id} не найден!`);
    this.style();
    this.events = [];
    this.graphics = new Graphics(this.canvasID, this.config.smooth, this);
    this.listenEvents();
    this.canvasID.focus();
    this.resize()
    this.info();
  }

  /** Выводит информацию о проекте */
  info() {
    console.info(`42eng (v${this.config.build.v})\nrepository: ${this.config.build.href}`);
  }

  style() {
    const all = document.querySelectorAll('html, body, canvas');
    for (const elem of all) {
      elem.style.cssText = `
        margin: 0;
        padding: 0;
        overflow: hidden;
        -webkit-touch-callout:none;
        -webkit-user-select:none;
        -khtml-user-select:none;
        -moz-user-select:none;
        -ms-user-select:none;
        user-select:none;
        -webkit-tap-highlight-color:rgba(0,0,0,0);
        touch-action: manipulation;
        background: #1e0528;
      `;

      if (elem.tagName == 'CANVAS') {
        elem.style.cssText += `
          position: absolute;
          image-rendering: auto;
          top: 0;
          left: 0;
          border: none;
          outline: none;
        `;
      }
    }
  }

  resize() {
    this.resized = true;
    this.canvasID.width = window.innerWidth;
    this.canvasID.height = window.innerHeight;
    this.canvasID.style.width = `${window.innerWidth}px`;
    this.canvasID.style.height = `${window.innerHeight}px`;
    
    if (this.graphics)
      this.graphics.reset();
  }

  addEvent(control) {
    this.events.push(control);
    this.listenEvents();
  }

  event(type, ...params) {
    console.log(type, params);
  }

  listenEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.event('resize');
    });
    window.addEventListener('focus', () => {
      this.focus = true;
      this.event('focus');
    });
    window.addEventListener('blur', () => {
      this.focus = false;
      this.event('blur');
    });
    this.canvasID.addEventListener('wheel', e => {
      if (!this.config.ignoreScroll)
        e.preventDefault();
    });
    this.canvasID.addEventListener('contextmenu', e => e.preventDefault());

    const funcKeyHandler = e => {
      if (e.key == 'Escape')
        return;
      if (e.type == 'keyup')
        this.event('anykey');

      for (const control of this.events)
        if (!control.event(e))
          return;

      e.preventDefault();
      e.stopImmediatePropagation();
    }
    window.addEventListener('keyup', funcKeyHandler);
    window.addEventListener('keydown', funcKeyHandler);

    const funcMouseHandler = e => {
      this.event('focus');
      const rect = this.canvasID.getBoundingClientRect();
      let client;

      if (e.type == 'touchstart' || e.type == 'touchend') {
        this.mouse.isTouch = true;
        this.mouse.event.add((e.type == 'touchend') ? 'uclick' : 'dclick');
        client = e.changedTouches[0];  
      } else {
        if (e.button) return;
        this.mouse.isTouch = false;
        this.mouse.event.add((e.type == 'mouseup') ? 'uclick' : 'dclick');
        client = e;
      }
      if (e.type == 'touchend' || e.type == 'mouseup')
        this.event('anykey');

      this.mouse.x = client.clientX - rect.left;
      this.mouse.y = client.clientY - rect.top;

      e.preventDefault();
      e.stopImmediatePropagation();
    }
    window.addEventListener('mouseup', funcMouseHandler);
    window.addEventListener('mousedown', funcMouseHandler);
    window.addEventListener('touchstart', funcMouseHandler);
    window.addEventListener('touchend', funcMouseHandler);
    
    const funcMouseMoveHandler = e => {
      const rect = this.canvasID.getBoundingClientRect();
      let client = e;
      if (e.type != 'mousemove') client = e.changedTouches[0];

      this.mouse.x = client.clientX - rect.left;
      this.mouse.y = client.clientY - rect.top;
    }
    window.addEventListener('mousemove', funcMouseMoveHandler);
    window.addEventListener('touchmove', funcMouseMoveHandler);
  }

  update(draw) {
    const _update = () => {
      const timenow = performance.now();
      this.deltatime = Math.min((timenow - this.delta) * .001, .05);
      this.delta = timenow;

      if (this.graphics) {
        this.graphics.source.viewport(0, 0, this.graphics.w, this.graphics.h);
        this.graphics.source.clearColor(0.11, 0.01, 0.15, 1.0);
        this.graphics.source.clear(this.graphics.source.COLOR_BUFFER_BIT);
        this.graphics.source.enable(this.graphics.source.BLEND);
        this.graphics.source.blendFunc(this.graphics.source.SRC_ALPHA, this.graphics.source.ONE_MINUS_SRC_ALPHA);

        if (this.resized) {
          this.ratio = Math.min(this.graphics.w, this.graphics.h);
          this.resized = false;
        }

        if (!this.loaded) LoadingScreen.draw(this.graphics, this, this.ratio);
        else draw(this.deltatime, this.graphics, this.ratio);
      }

      this.current_time = (this.current_time + this.deltatime * 4) % 1000;
      if (!this.config.window.hideCursor)
        this.canvasID.style.cursor = this.mouse.event.check('hover') ? 'pointer' : 'default';
      else this.canvasID.style.cursor = 'none';
      if (this.mouse.event.key)
        this.mouse.event.clear('uclick', 'hover', 'dclick');

      this.graphics.source.enableVertexAttribArray(this.graphics.positionLocation);
      window.requestAnimationFrame(_update);
    }
    _update();
  }
}
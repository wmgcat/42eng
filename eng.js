// hook:

String.prototype.replaceAll = function(match, replace) {
  return this.replace(new RegExp(match, 'g'), () => replace);
}

let ERROR = { 
  NOFILE: 1, NOSUPPORT: 2 
}

let cfg = {
  title: '42eng.js', debug: false,
  build: {
    v: '1.7.2',
    href: 'github.com/wmgcat/42eng'
  },
  grid: 32, zoom: 1,
  window: {
    width: 800, height: 600,
    fullscreen: true, id: 'game'
  },
  modulepath: './modules/',
  datapath: ''
};

let Eng = {
	id: () => {
		let a4 = () => { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }, separator = '.';
		return '#id' + a4() + a4() + separator + a4() + a4() + separator + a4() + a4() + separator + a4() + a4();
	},
	copy: source => {
		let arr = {};
		Object.keys(source).forEach(function(e) { arr[e] = source[e]; });
		return arr;
	},
	console: () => {
    let img = [
      `      /\\`,
      `     /  \\        42eng.js by wmgcat`,
      `    /    \\       v: ${cfg.build.v}`,
      `   /......\\      ${cfg.build.href}`,
      `  < o L o >`
    ];
    let sum = '';
    img.forEach(line => { sum += line + '\n'; });
    console.log(sum);
  }
};

let loaded = 0, mloaded = 0, current_time = 0, current_level = 0, current_camera = 0;
let pause = false, editor = false, levelChange = false, is_touch = false;
let render = [], gui = [], cameraes = [{'x': 0, 'y': 0}], modules = {};
let keylocks = {}, grid = {}, levelMemory = {}, objects = {}, templates = {}, images = {};
let mouse = {'x': 0, 'y': 0, 'touch': {'x': 0, 'y': 0}}, bind = false;

let Add = {
	rule: function(char, key) {
		if (typeof(char) == 'object') { Object.keys(char).forEach(function(k) { keylocks[k] = char[k]; });
		} else {
			if (arguments.length > 2) for (let i = 0; i < arguments.length; i += 2) keylocks[arguments[i]] = arguments[i + 1];
			else keylocks[char] = key;
		}
	},
	script: async function(source) {
		try {
      for (let i = 0; i < arguments.length; i++) {
        mloaded++;
        let script = document.createElement('script'), promise = new Promise((res, rej) => {
          script.onload = function() {
            loaded++;
            res(true);
          }
          script.onerror = function() { rej(arguments[i]);  }
        });
        script.type = 'text/javascript';
        script.src = arguments[i];
        document.head.appendChild(script);
        Add.debug('added script', arguments[i]);
        await promise;
      }
    } catch(err) { return this.error(err, ERROR.NOFILE); }
	  return true;
  },
	error: (msg, code=0) => { console.error('ERROR!', msg, code); },
	canvas: (init, update, loading) => {
		let cvs = document.getElementById(cfg.window.id), getSize = () => {
      cvs.style.background = '#000';
      let {width, height} = cfg.window;
      if (cfg.window.fullscreen) [width, height] = [document.body.clientWidth, document.body.clientHeight];
      return [width, height];
    };
		if (!cvs) {
			cvs = document.createElement('canvas');
      [cvs.width, cvs.height] = getSize();
      document.body.appendChild(cvs);
		}
		let ctx = cvs.getContext('2d');
		let keyChecker = e => {
		  cfg.setting.user = true;
      if (modules.audio) {
        audio.context.resume();
        Eng.focus(true);
      }
      if (bind) {
        let code = e.code.toLowerCase();
        if (!bind.check('textbox')) {
          for (let key in keylocks) {
            if (code.replace('key', '') == key) {
              bind[e.type == 'keydown' ? 'add': 'clear'](keylocks[key]);
              break;
            }
          }
          e.preventDefault();
          e.stopImmediatePropagation();
        } else {
          switch(code) {
            case 'enter':
              if (modules.graphics) Add.textbox().hide();
              //Add.debug('press enter!');
              e.preventDefault();
              e.stopImmediatePropagation();
            break;
          }
        }
      }
    }, mouseChecker = e => {
      let xoff = (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove') ? e.offsetX : e.changedTouches[0].clientX,
			    yoff = (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove') ? e.offsetY : e.changedTouches[0].clientY;
			switch(e.type) {
				case 'mousedown': case 'mouseup': case 'mousemove':
					mouse.x = cameraes[current_camera].x + xoff;
					mouse.y = cameraes[current_camera].y + yoff;
				break;
				case 'touchstart': case 'touchend': case 'touchmove':
					mouse.x = cameraes[current_camera].x + xoff;
					mouse.y = cameraes[current_camera].y + yoff;
					mouse.touch = { x: xoff, y: yoff };
				break;
			}
      if (bind) {
        switch(e.type) {
          case 'mouseup': case 'touchend':
            is_touch = false;
            bind.add('uclick');
            cvs.focus();
          break;
          case 'mousedown': case 'touchstart': bind.add('dclick'); break;
        }
      }
			if (e.type == 'touchstart') is_touch = true;
			if (modules.audio && e.type != 'mousemove') {
        cfg.setting.user = true;
			  modules.audio.context.resume();
			  Eng.focus(true);
			}
      e.preventDefault();
      e.stopImmediatePropagation();
		}, ready = () => {
			addEventListener('keydown', keyChecker, false);
			addEventListener('keyup', keyChecker, false);
      addEventListener('contextmenu', e => { e.preventDefault(); }, false);
			if (modules.audio) Eng.focus(true);
		}, resize = () => {
      [cvs.width, cvs.height] = getSize();
      ctx = cvs.getContext('2d');
      ctx.imageSmoothingEnabled = false;
		}, temp = t => {
      if (!bind && modules.byte) { // byte support:
        let arr = [];
        for (key in keylocks) arr.push(keylocks[key]);
        arr.push('uclick', 'dclick', 'hover', 'textbox');
        bind = new Byte(arr);
      }
      gui = [];
      if (loaded == mloaded) {
        ctx.save();
          ctx.scale(cfg.zoom, cfg.zoom);
          ctx.translate(-cameraes[current_camera].x / cfg.zoom, -cameraes[current_camera].y / cfg.zoom);
          update(t);
          for (const id of Object.keys(objects).sort((a, b) => (objects[a].yr || objects[a].y) - (objects[b].yr || objects[b].y))) {
            let obj = objects[id];
            if (!obj) continue;
            if (!editor && !obj.is_create && obj.create) {
              obj.create();
              obj.is_create = true;
            }
            if (!pause && obj.update) obj.update(t);
            if (obj.draw) obj.draw(ctx);
          }
        ctx.restore();
        gui.reverse().forEach(function(e) { e(ctx); });
      } else loading(loaded / mloaded, t); 
      if (bind) {
        cvs.style.cursor = bind.check('hover') ? 'pointer' : 'default';
        bind.clear('hover', 'dclick', 'uclick');
      }
      current_time = t;	
			window.requestAnimationFrame(temp);
		}
		window.onmousedown = window.onmouseup = window.onmousemove = cvs.ontouchstart = cvs.ontouchend = cvs.ontouchmove = mouseChecker;
		ready();
		if ('mediaSession' in navigator) {
		  navigator.mediaSession.setActionHandler('play', () => { })
		  navigator.mediaSession.setActionHandler('pause', () => { })
		  navigator.mediaSession.setActionHandler('seekbackward', () => { })
		  navigator.mediaSession.setActionHandler('seekforward', () => { })
		  navigator.mediaSession.setActionHandler('previoustrack', () => { })
		  navigator.mediaSession.setActionHandler('nexttrack', () => { })
		} 
    let obj = { id: cvs, cvs: ctx, update: temp, init: init }
		window.onresize = document.body.onresize = cvs.onresize = resize;
		resize();
		Eng.console();
		return obj;
	},
	object: (obj, x=0, y=0, nid=false) => {
    if (typeof(obj) == 'string') obj = templates[obj];
		let id = nid || Eng.id(); 
    objects[id] = Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
    objects[id].x = x;
    objects[id].y = y;
    objects[id].id = id;
    return objects[id];
	},
	gui: func => gui.push(func),
	debug: function(arg) { if (cfg.debug) console.log('[DEBUG!]', ...arguments); },
  module: async function() {
    try {
      for (let i = 0; i < arguments.length; i++) {
        mloaded++;
        let name = arguments[i], script = document.createElement('script'), promise = new Promise((res, rej) => {
          script.onload = function() {
            let source = name.split('.js')[0].split('/').slice(-1)[0];
            loaded++;
            window[source] = modules[source];
            Add.debug(`added: ${source} module!`);
            res(true);
          }
          script.onerror = function() { rej(name); }
        });
        script.type = 'text/javascript';
        script.src = `${cfg.modulepath}${name}.js`;
        document.head.appendChild(script);
        await promise;
      }
    } catch(err) { return this.error(err, ERROR.NOFILE); }
  },
  test: async func => {
    let date = Date.now();
    try {
      await func();
      Add.debug('function is done!', `${(Date.now() - date) / 1000}s`);
      return true;
    }
    catch (err) {
      Add.error(err, 0);
      Add.debug('timeout', `${(Date.now() - date) / 1000}s`);
      return false;
    }
  }
}

class Obj {
  constructor(name='undefined') {
    this.name = name;
    this.x = this.y = this.image_index = 0;
    templates[name] = this;
  }
  destroy() {
    if (this.delete) objects[this.id].delete();
    delete objects[this.id];
    return true;
  }
}
// hook:

String.prototype.replaceAll = function(match, replace) {
  return this.replace(new RegExp(match, 'g'), () => replace);
}

const ERROR = { 
  NOFILE: 1, NOSUPPORT: 2 
}

let cfg = {
  title: '42eng.js', debug: false,
  build: {
    v: 1.7,
    href: 'github.com/wmgcat/42eng'
  },
  grid: 32, zoom: 1,
  window: {
    width: 800, height: 600,
    fullscreen: true, id: 'game'
  },
  modulepath: './modules/'
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



let loaded = 0, mloaded = 0, current_time = 0, current_level = 0, current_camera = 0, is_loaded = false;
let pause = false, editor = false, levelChange = false, is_touch = false;
let render = [], gui = [], cameraes = [{'x': 0, 'y': 0}], modules = {};
let keylocks = {}, grid = {}, levelMemory = {}, objects = {}, templates = {}, images = {};
let mouse = {'x': 0, 'y': 0, 'touch': {'x': 0, 'y': 0}};

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
        await promise;
      }
    } catch(err) { return this.error(err, ERROR.NOFILE); }
	},
	error: (msg, code=0) => { console.log('ERROR!', msg, code); },
	canvas: (gameinit, update, loading) => {
		let cvs = document.getElementById(cfg.window.id);
		if (!cvs) {
			cvs = document.createElement('canvas');
			let w = cfg.window.width, h = cfg.window.height;
			if (cfg.window.fullscreen) {
				w = document.body.clientWidth;
				h = document.body.clientHeight;
			}
			cvs.width = w;
			cvs.height = h;
			document.body.appendChild(cvs);
		}
		let ctx = cvs.getContext('2d');
		let keyChecker = e => {
			if (modules.audio) Eng.focus(true);
    		cfg.setting.user = true;
    		audio.context.resume();
    		if (e.code.toLowerCase() == 'tab') {
    			e.preventDefault();
				  e.stopImmediatePropagation();
    		}
    		Object.keys(keylocks).forEach(function(f) {
				if (e.code.toLowerCase().replace('key', '') == f) {
					switch(e.type) {
						case 'keydown': byte.add(keylocks[f]); break;
						case 'keyup': byte.clear(keylocks[f]); break;
					}
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			});
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
			switch(e.type) {
				case 'mouseup': case 'touchend':
					is_touch = false;
					byte.add('uclick');
					cvs.focus();
				break;
				case 'mousedown': case 'touchstart': byte.add('dclick'); break;
			}
			if (e.type == 'touchstart') is_touch = true;
			if (modules.audio) {
        cfg.setting.user = true;
			  modules.audio.context.resume();
			  Eng.focus(true);
			}
      e.preventDefault();
		}, ready = () => {
			addEventListener('keydown', keyChecker, false);
			addEventListener('keyup', keyChecker, false);
			if (modules.audio) Eng.focus(true);
		}, resize = () => {
			try {
				let w = cfg.window.width, h = cfg.window.height;
				if (cfg.window.fullscreen) {
					w = document.body.clientWidth, h = document.body.clientHeight;
					cfg.window.width = w;
					cfg.window.height = h;
				}
				cvs.width = w, cvs.height = h;
				obj.ctx = cvs.getContext('2d');
				obj.ctx.imageSmoothingEnabled = false;
			}
			catch(err) { Add.error(err.message); }
		}, temp = t => {
      gui = [];
      if (loaded >= mloaded && !is_loaded) {
        if (gameinit) gameinit();
        is_loaded = true;
      }
      if (is_loaded) {
        ctx.save();
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        ctx.scale(cfg.zoom, cfg.zoom);
        ctx.translate(-cameraes[current_camera].x / cfg.zoom, -cameraes[current_camera].y / cfg.zoom);
        update(current_time);
        Object.keys(objects).sort((a, b) => (objects[a].yr || objects[a].y) - (objects[b].yr || objects[b].y)).forEach(id => {
          let obj = objects[id];
          if (!obj.is_create && obj.create && !editor) {
            obj.create();
            obj.is_create = true;
          }
          if (obj.update && !pause) obj.update();
          if (obj.draw) obj.draw(ctx);
        });
        ctx.restore();
      } else loading(loaded / mloaded, current_time);
      gui.reverse().forEach(function(e) { e(ctx); });
      if (modules.byte) {
        cvs.style.cursor = byte.check('hover') ? 'pointer' : 'default';
        byte.clear('hover', 'dclick', 'uclick');
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
    let obj = { id: cvs, cvs: ctx, update: temp, init: gameinit }
		window.onresize = document.body.onresize = cvs.onresize = resize;
		resize();
		Eng.console();
		return obj;
	},
	object: (obj, x=0, y=0) => {
    if (typeof(obj) == 'string') obj = templates[obj];
		let id = Eng.id(); 
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



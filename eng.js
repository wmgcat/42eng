'use strict';

// hook:
String.prototype.replaceAll = function(match, replace) {
  return this.replace(new RegExp(match, 'g'), () => replace);
}

let cfg = { // основной конфиг:
	title: '42eng.js',
	grid: 32, zoom: 1, debug: false,
	build: { v: 1.6, href: '' },
	setting: {
		music: 1, sounds: 1,
		mute: false, user: false,
		focus: true, listener: 10,
		fps: 60
	},
	window: {
		fullscreen: true,
		width: 800, height: 600,
		id: 'game'
	}
};
let Eng = { // все методы движка:
	'id': () => {
		let a4 = () => { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }, separator = '.';
		return '#id' + a4() + a4() + separator + a4() + a4() + separator + a4() + a4() + separator + a4() + a4();
	},
	'wait': (func, success, error) => {
		new Promise(func).then(
			value => success(value),
			err => error(err.message)
		).catch(err => { console.log('lol', err); });
	},
	'timer': (func, time) => {
		let t = setInterval(() => {
			if (func && func()) clearInterval(t);
		}, time);
		return t;
	},
	'copy': source => {
		let arr = {};
		Object.keys(source).forEach(function(e) { arr[e] = source[e]; });
		return arr;
	},
	focus: value => {
		switch(value) {
			case true:
				cfg.setting.focus = true;
				window.focus();
			break;
			case false:
				cfg.setting.focus = false;
				audio.setvolume('music', 0);
				audio.setvolume('sounds', 0);
				window.blur();
			break;
		}
	},
	'console': { // работа с консолью:
		'release': () => {
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
		},
		'show': (cvs, clr) => {
			if (errors.length > 0) {
				if (cvs) {
					cvs.fillStyle = clr || '#fff';
					errors.forEach(function(e, i) {
						Add.gui(function(cvs) {
							cvs.globalAlpha = 1 - (errors.length - (i + 1)) / errors.length;
							cvs.fillText(i + ': ' + e, 6, 16 + 12 * i);
						});
					});
					cvs.globalAlpha = 1;
				} else {
					console.log('Найдены ошибки (' + errors.length + '):');
					errors.forEach(function(e, i) { console.error(i + ': ' + e); });
					errors = [];
				}
			}
		}
	}
};

var AudioContext = window.AudioContext || window.webkitAudioContext || false;

let loaded = 0, mloaded = 0, current_time = 0, current_level = 0, current_camera = 0, is_loaded = false;
let pause = false, editor = false, mute = false, levelChange = false, is_touch = false, cvs_delta = 0;
let errors = [], render = [], gui = [], cameraes = [{'x': 0, 'y': 0}], modules = {};
let audio = {
	'stack': {},
	'context': AudioContext ? new AudioContext : false,
	'play': (id, loop) => { if (audio.context && audio.stack && audio.stack[id]) audio.stack[id].play(loop); },
	'setvolume': (type, volume) => {
		if (audio.context) {
      if (!audio[type + '_volume']) audio[type + '_volume'] = audio.context.createGain();
		  audio[type + '_volume'].gain.value = volume;
	  }
  },
	'listener': [],
	'stop': id => { if (audio.stack && audio.stack[id]) audio.stack[id].stop(); }
}, keylocks = {}, grid = {}, levelMemory = {}, memory = {}, images = {};
if (audio.context)
  audio.context.onstatechange = () => {
	  if (audio.context.state === "interrupted") audio.context.resume();
  }
let lang = {'type': '', 'source': {}, 'use': function() { // translate lang:
	let str = arguments['0'];
	for (let i = 0; i < arguments.length; i++) {
		if (!i) {
			let path = arguments[i].split('.'), pos = 0, arr = lang.source[lang.type] || {};
			while(arr[path[pos]]) {
				if (typeof(arr[path[pos]]) == 'string') {
					str = arr[path[pos]];
					break;
				} else arr = arr[path[pos++]];
			}
		} else { if (str) str = str.replace('%s', lang.use(arguments[i])); }
	}
	return str;
}}, mouse = {'x': 0, 'y': 0, 'touch': {'x': 0, 'y': 0}};
/*
    \0/ ** add content ** \0/
	rule(char, key || object) - добавление клавиш управления;
	script(src, 1..n) - добавление скриптов;
	audio([type, src] or {src: type, src2: type, srcN: type}) - добавление звуков, музыки;
	image(src, 1..n) - добавление изображений;
	error(msg) - создание ошибок;
	canvas(id, update, loading) - создание холста для игры,
		поиск canvas по id,
		в update(t) происходит обновление всех объектов и их отрисовка,
		в loading(loaded, t) экран загрузки;
	object(name, x, y) - добавление копии игрового объекта на уровень;
	language(path, short, main) - добавление локализации для игры, где
		path - путь до файла,
		short - сокращение языка (ru, en, fr),
		main - автоматический выбор при загрузке игры (true / false);
	чтобы использовать перевод нужно использовать метод lang.use(arg0..N);
	gui(func) - рисует внутри функции поверх игры;
	debug(args...) - отображает сообщения для дебага ( работает только в debug моде );
	\###=#=##======##=#=###/
*/
let Add = {
	'rule': function(char, key) {
		if (typeof(char) == 'object') { Object.keys(char).forEach(function(k) { keylocks[k] = char[k]; });
		} else {
			if (arguments.length > 2) for (let i = 0; i < arguments.length; i += 2) keylocks[arguments[i]] = arguments[i + 1];
			else keylocks[char] = key;
		}
	},
	'script': function(source) {
		for (let i = 0; i < arguments.length; i++) {
			mloaded++;
			let script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = arguments[i];
			script.onload = function() { loaded++; }
			script.onerror = function() { return this.error(arguments[i] + ' not find!'); }
			document.head.appendChild(script);
		}
	},
	'audio': function(type='sounds', source) {
		if (Object.keys(arguments).length > 1) {
			mloaded++;
			let path = source.split('/');
			if (path[0] == '.') path = path.splice(1, path.length - 1);
			['.wav', '.ogg', '.mp3'].forEach(assoc => { path[path.length - 1] = path[path.length - 1].replace(assoc, ''); });
			let req = new XMLHttpRequest();
			req.open('GET', source, true);
			req.responseType = 'arraybuffer';
			req.onload = () => {
				let sa = req.response;
				audio.context.decodeAudioData(req.response, buff => {
					loaded++;
					if (audio.stack) audio.stack[path.join('.')] = new Sound(buff, type);
				});
			}
			req.onerror = () => {
				/*let sa = new Audio(source);
				sa.disableRemotePlayback = true;
				sa.onerror = err => { return Add.error(source + ' not find!'); }
				sa.oncanplaythrough = () => { loaded++; }
				sa.load(); 
				if (audio.stack) audio.stack[path.join('.')] = new Sound(sa, type);*/
			}
			req.send();
		} else { // добавление несколько файлов в одну команду:
			if (typeof(type) == 'object') {
				Object.keys(type).forEach(key => Add.audio(type[key], key));
			} else Add.error('type audio not find!');
		}
	},
	'error': msg => {
		errors[errors.length] = msg;
		console.error(msg);
	},
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
			Eng.focus(true);
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
			cfg.setting.user = true;
			audio.context.resume();
			Eng.focus(true);
			e.preventDefault();
		}, ready = () => {
			addEventListener('keydown', keyChecker, false);
			addEventListener('keyup', keyChecker, false);
			Eng.focus(true);
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
			let now = Date.now(), delta = now - cvs_delta, fps = 1000 / cfg.setting.fps;
			if (delta > fps) {
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
          update(t);
					render.sort(function(a, b) { return (a.obj.yr || a.obj.y) - (b.obj.yr || b.obj.y); }).forEach(e => {
						if (e.obj.update && !pause) e.obj.update();
						if (!e.obj.is_init && e.obj.initialize && !editor) {
							e.obj.initialize();
							e.obj.is_init = true;
						}
						e.func(ctx);
						if (e.obj.DELETED) { // удаление удаленных объектов
							let ind = memory.lobjects.findIndex(nobj => { return nobj.id == e.obj.id; });
							memory.lobjects.splice(ind, 1);
						}
					});
					ctx.restore();
					render = [];
				} else loading(loaded / mloaded, t);
				gui.reverse().forEach(function(e) { e(ctx); });
				if (modules.byte) {
          cvs.style.cursor = byte.check('hover') ? 'pointer' : 'default';
				  byte.clear('hover', 'dclick', 'uclick');
				}
        current_time = t;
				cvs_delta = now - (delta % fps);
			}
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
		window.onblur = () => {
			cfg.setting.focus = false;
			audio.setvolume('music', 0);
			audio.setvolume('sounds', 0);
		}
		window.onfocus = () => { audio.context.suspend().then(() => { cfg.setting.focus = true; }); }
		let obj = { id: cvs, cvs: ctx, update: temp, init: gameinit }
		window.onresize = document.body.onresize = cvs.onresize = resize;
		resize();
		Eng.console.release();
		return obj;
	},
	'object': (obj, x=0, y=0) => {
		if (typeof(obj) == 'string' && memory.editor) {
			let ind = memory.editor.objects.findIndex(o => { return o.name == obj; });
			if (ind != -1) obj = memory.editor.objects[ind];
		}
		obj.x = x, obj.y = y;
		if (!memory.lobjects) memory.lobjects = [];
		memory.lobjects[memory.lobjects.length] = Eng.copy(obj);
		memory.lobjects[memory.lobjects.length - 1].id = Eng.id();
		return memory.lobjects[memory.lobjects.length - 1];
	},
	'language': (path, short, main) => {
		let script = document.createElement('script');
		script.src = path;
		mloaded++;
		script.onload = () => {
			lang.source[short] = Eng.copy(Lang);
			if (main) lang.type = short;
			loaded++;
		}
		script.onerror = () => { return Add.error(path + ' not find!'); }
		document.body.appendChild(script);
	},
	'gui': func => gui.push(func),
	debug: function(arg) { if (cfg.debug) console.log('[DEBUG!]', ...arguments); },
  module: function(path) {
    let new_path = path == '--custom';
    for (let i = 0; i < arguments.length; i++) {
      if (arguments[i] == '--custom') continue;
      mloaded++;
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = new_path ? arguments[i] : `./modules/${arguments[i]}.js`;
      script.onload = () => {
        let source = arguments[i].split('.js')[0].split('/').slice(-1)[0];
        loaded++;
        window[source] = modules[source];
        this.debug(`added ${source} module!`);
      }
      script.onerror = () => {
        if (new_path) return this.error(arguments[i] + ' not find!');
        else this.module('--custom', arguments[i]);
      }
      document.head.appendChild(script);
    }
  }
}
/* игровые объекты */
let Obj = {
	'init': function(name='undefined') {
		if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) this.init(arguments[i]);
		else {
			this.x = this.y = this.image_index = 0, this.name = name;
			let obj = Eng.copy(this);
			if (!memory.editor) memory.editor = { 'objects': [] };
			memory.editor.objects.push(obj);
			return obj;
		}
	},
	'draw': function(func=()=>{}) { render.push({ 'obj': this, 'func': func }); },
	'destroy': function() {
		this.DELETED = true;
		if (this.delete) this.delete();
		return true;
	}
};
/* карта */
class Map {
	constructor(width=1, height=1, x=0, y=0) {
		this.w = width, this.h = height, this.x = x,
		this.y = y, this.yr = -1000, this.memory = {}, this.grid = [];
		for (let i = 0; i < width; i++) {
			this.grid.push([]);
			for (let j = 0; j < height; j++) this.grid[i][j] = 0;
		}
	}
	reg(key, value, img) { this.memory[key] = !img ? value : [value, img]; }
	set(x, y, value) { this.grid[x][y] = value; }
	get(x, y) { return Math.floor(this.grid[x][y]); }
	draw(func) {
		if (func) render.push({
			'obj': { 'yr': this.yr },
			'func': func
		});
	}
	path(i, j, ni, nj) {
		let points = [[i, j]], rpoints = [], count = 20;
		while (count) {
			for (let d = 0; d < 4; d++) {
				let xx = points[points.length - 1][0] + ((d == 0) - (d == 2)), yy = points[points.length - 1][1] + ((d == 3) - (d == 1));
				if (xx < this.grid.length && yy < this.grid[0].length && xx > -1 && yy > -1)
					if (this.get(xx, yy) == this.get(i, j)) {
						let find = false;
						for (let k = 0; k < points.length; k++)
							if (points[k][0] == xx && points[k][1] == yy) {
								find = true;
								break;
							}
						if (!find) rpoints[rpoints.length] = [Eng.math.distance(xx, yy, ni, nj), xx, yy];
					}
			}
			if (rpoints.length > 0) {
				let c = rpoints.sort(function(a, b) { return a[0] - b[0]; })[0];
				points[points.length] = [c[1], c[2]];
				rpoints = [];
				if (c[1] == ni && c[2] == nj) break;
			} else break;
			if (count-- <= 0) break;
		}
		return points.slice(0, points.length);
	}
}
/*    __
     _||_      
     |^^|      уровни:
     \  /      init(src, Map, run) - загрузка уровня, src - путь к файлу, Map - объект карты куда загружать карту уровня, run - автозапуск уровня;
   | |  | |    load(id, Map) - загрузка подуровня или другого уровня, используя его id и ссылку на объект Map куда будет загружаться сам уровень;
   /_|  |_\	   save() - сохранение состояния текущего уровня;
	|____|
	|_   |_
*/
let Level = {
	'init': function(src, map, run) {
		this.levels = {}, this.location = false, this.default = false;
		this.path = src;
		mloaded++;
		let script = document.createElement('script');
		script.src = src;
		let main = Eng.copy(this);
		script.onload = function() {
			if (datapack.levels) {
				main.levels = {};
				Object.keys(datapack.levels).forEach(function(e) {
					main.levels[e] = {};
					Object.keys(datapack.levels[e]).forEach(function(key) { main.levels[e][key] = datapack.levels[e][key]; });
				});
				if (datapack.started) main.default = main.location = datapack.started;
			}
			main.color = datapack.color;
			if (datapack.textmap) {
				main.textmap = datapack.textmap;
				if (run) for (let i = 0; i < main.textmap.length; i++) map.registry(main.textmap[i][0], main.textmap[i][1], Img.init(main.textmap[i][2], main.textmap[i][3], main.textmap[i][4], cfg.grid, cfg.grid));
			}
			if (datapack.ost) main.ost = datapack.ost;
			if (run) main.load(main.location || main.levels[Object.keys(main.levels)[0]], map);
			levelMemory[src] = Eng.copy(main);
			loaded++;
		}
		script.onerror = function() { return Add.error(src + ' не найден!'); }
		document.body.appendChild(script);
	},
	'load': function(id, map, changemap, saved) {
		if (this.levels[id]) {
			if (!changemap && !saved) this.save();
			this.location = id;
			memory.lobjects = [], levelChange = true, memory.saveobjects = [];
			this.levels[id].objects.forEach(function(e) {
				if (e != null) {
					let obj = Add.object(Obj, e.x, e.y);
					Object.keys(e).forEach(function(f) { obj[f] = e[f]; });
					obj.loadedevent = true;
					memory.saveobjects.push(Eng.copy(obj));
				}
			});
			function copymap(map) {
				let arr = [];
				for (let i = 0; i < map.length; i++) {
					arr[arr.length] = [];
					for (let j = 0; j < map[i].length; j++) arr[i][j] = map[i][j];
				}
				return arr;
			}
			for (let i = 0; i < map.grid.length; i++)
				for (let j = 0; j < map.grid[i].length; j++) map.grid[i][j] = 0;
			if (this.levels[id].map) map.grid = copymap(this.levels[id].map), map.w = this.levels[id].map.length, map.h = this.levels[id].map[0].length;
			
			if (current_level != this) current_level = this;
			this.save();
		} else {
			let sublocation = false;
			if (id.split('|').length > 1) {
				sublocation = id.split('|')[1];
				id = id.split('|')[0];
			}
			if (levelMemory[id]) {
				if (!saved) this.save();
				current_level.location = current_level.default;
				current_level = levelMemory[id];
				map.memory = {};
				if (current_level.textmap) for (let i = 0; i < current_level.textmap.length; i++) map.registry(current_level.textmap[i][0], current_level.textmap[i][1], Img.init(current_level.textmap[i][2], current_level.textmap[i][3], current_level.textmap[i][4], cfg.grid, cfg.grid));
				current_level.load(sublocation || current_level.location, map, true);
			} else {
				if (this.levels[id]) {
					map.memory = {};
					if (current_level.textmap) for (let i = 0; i < current_level.textmap.length; i++) map.registry(current_level.textmap[i][0], current_level.textmap[i][1], Img.init(current_level.textmap[i][2], current_level.textmap[i][3], current_level.textmap[i][4], cfg.grid, cfg.grid));
					playerGoto = sublocation;
					current_level.load(id, map, true);
				}
			}
		}
	},
	'save': function(one, id) {
		if (memory.lobjects) {
			let mem = this.levels[this.location].objects;
			memory.lobjects.forEach(function(e) {
				for (let i = 0; i < mem.length; i++) {
					if (!one) {
						if (mem[i] != null && e.id == mem[i].id && !e.unsave) {
							Object.keys(e).forEach(function(f) { mem[i][f] = e[f]; });
							break;
						}
					} else {
						if (mem[i] != null && e.id == mem[i].id && e.id == id) {
							Object.keys(e).forEach(function(f) { mem[i][f] = e[f]; });
							break;
						}
					}
				}
			});
		}
	}
};

/*
  ====_______
     =======|		* _ * \\ Звуки и Музыка // * _ *
    ____   ||		
       ====||		play(loop) - воспроизведение музыки, с возможностью зацикливания;
           ||		stop() - останавливает воспроизведение музыки;
           ||__
           ||===\
           ||===|
           ||===/
*/
class Sound {
	constructor(sa, type) {
		this.audio = sa, this.type = type, this.index = -1;
	}
	play(loop) {
		if (audio.context && !cfg.setting.mute && cfg.setting.user) {
			if (audio.listener.length <= cfg.setting.listener) {
				audio.listener.push(audio.context.createBufferSource());
				this.index = audio.listener[audio.listener.length - 1];
				this.index.buffer = this.audio;
				this.index.connect(audio[this.type + '_volume']).connect(audio.context.destination);
				if (this.index.start) this.index.start(audio.context.currentTime);
				this.index.onended = () => { this.stop(); }
				this.index.loop = loop;
			}
		}
	}
	stop() { 
		if (audio.context && this.index != -1) {
			if (this.index.stop) this.index.stop();
			let ind = audio.listener.findIndex(e => { return e == this.index; });
			if (ind != -1) audio.listener = audio.listener.splice(ind, 1);
			this.index = -1;
		}
	}
}

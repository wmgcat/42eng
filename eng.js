'use strict';

// hook:
String.prototype.replaceAll = function(match, replace) {
  return this.replace(new RegExp(match, 'g'), () => replace);
}

let cfg = { // основной конфиг:
	'title': '42engine.js',
	'grid': 32, 'zoom': 1, 'debug': false,
	'build': { 'v': '1.5', 'href': '' },
	'macros': {
		'up': 1, 'down': 2, 'left': 4, 'right': 8,
		'active': 16, 'mode': 32, 'dclick': 64, 'uclick': 128,
		'move': 256, 'hover': 512
	},
	'setting': {
		'music': 1, 'sounds': 1,
		'mute': false, 'user': false,
		'focus': true, 'listener': 10,
		'fps': 60
	},
	'window': {
		'fullscreen': true,
		'width': 800, 'height': 600,
		'id': 'game'
	}
};
let Eng = { // все методы движка:
	'id': () => {
		let a4 = () => { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }, separator = '.';
		return '#id' + a4() + a4() + separator + a4() + a4() + separator + a4() + a4() + separator + a4() + a4();
	},
	'math': {
		'distance': (x1, y1, x2, y2) => { return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)); },
		'direction': (x1, y1, x2, y2) => { return Math.atan2(y2 - y1, x2 - x1); },
		'sign': x => { return ((Math.round(x) > 0) - (Math.round(x) < 0)) * (Math.round(x) != 0); },
		'clamp': (x, min, max) => { return Math.min(Math.max(x, min), max); },
		'torad': x => { return x * Math.PI / 180; },
		'todeg': x => { return x / Math.PI * 180; }
	},
	'collision': {
		'rect': (px, py, x, y, w, h) => { return ((px >= x) && (px <= (x + w)) && (py >= y) && (py <= (y + (h || w)))); },
		'circle': (px, py, x, y, range) => { return Eng.math.distance(px, py, x, y) <= range; },
		'mouse': {
			'rect': (x, y, w, h) => { return Eng.collision.rect(mouse.x, mouse.y, x * cfg.zoom, y * cfg.zoom, w * cfg.zoom, (h || w) * cfg.zoom); },
			'grect': (x, y, w, h) => { return Eng.collision.rect(mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y, x, y, w, h || w); },
			'circle': (x, y, range) => { return Eng.collision.circle(mouse.x, mouse.y, x * cfg.zoom, y * cfg.zoom, range * cfg.zoom); },
			'gcircle': (x, y, range) => { return Eng.collision.circle(mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y, x, y, range); }
		}
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
	'emitter': (params, x, y, count, range, gui) => {
		for (let i = 0; i < count; i++) {
			let nx = x + Math.random() * range * 2 - range, ny = y + Math.random() * range * 2 - range;
			if (Eng.collision.rect(nx, ny, cameraes[current_camera].x - cfg.grid, cameraes[current_camera].y - cfg.grid, cfg.window.width + cfg.grid * 2, cfg.window.height + cfg.grid * 2)) {
				Part.init(params, nx, ny, gui);
			}
		}
	},
	'focus': value => {
		//if (window) {
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
		Add.debug('окно ' + (value ? 'в фокусе' : 'не в фокусе'));
		//}
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
let errors = [], render = [], gui = [], cameraes = [{'x': 0, 'y': 0}];
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
	  Add.debug('Состояние audio.context', audio.context.state);
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
			//if (!audio[type + '_volume']) audio.setvolume(type, 1);
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
	'image': function(source) {
		for (let i = 0; i < arguments.length; i++) {
			mloaded++;
			let str = arguments[i];
			let img = new Image(), path = arguments[i].split('/');
			img.src = arguments[i];

			if (path[0] == '.') path = path.splice(1, path.length - 1);
			path[path.length - 1] = path[path.length - 1].replace('.png', '').replace('.jpg', '').replace('.gif', '').replace('.jpeg', '');
			img.onload = function() {
				Add.debug('картинка загружена!', img.src);
				loaded++;
			}
			img.onerror = function() { return Add.error(path + ' not find!'); }
			images[path.join('.')] = img;
			if (arguments.length <= 1) return path.join('.');
		}
	},
	'error': msg => {
		errors[errors.length] = msg;
		console.error(msg);
	},
	'canvas': (init, update, loading) => {
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
    			Add.debug(`Нажата ${e.code} клавиша!`);
    			e.preventDefault();
				e.stopImmediatePropagation();
    		}
    		Object.keys(keylocks).forEach(function(f) {
				if (e.code.toLowerCase().replace('key', '') == f) {
					switch(e.type) {
						case 'keydown': Byte.add(keylocks[f]); break;
						case 'keyup': Byte.clear(keylocks[f]); break;
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
					mouse.touch = {
						'x': xoff,
						'y': yoff
					};
				break;
			}
			switch(e.type) {
				case 'mouseup': case 'touchend':
					is_touch = false;
					Byte.add('uclick');
					cvs.focus();
				break;
				case 'mousedown': case 'touchstart': Byte.add('dclick'); break;
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
			//cvs.onkeydown = cvs.onkeyup = keyChecker;
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
				if (loaded >= mloaded && !is_loaded) is_loaded = true;
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
				cvs.style.cursor = Byte.check('hover') ? 'pointer' : 'default';
				Byte.clear('hover', 'dclick', 'uclick');
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
			Add.debug('Окно потеряло фокус!');
			cfg.setting.focus = false;
			audio.setvolume('music', 0);
			audio.setvolume('sounds', 0);
		}
		window.onfocus = () => {
			audio.context.suspend().then(() => {
				cfg.setting.focus = true;
				Add.debug('Окно получило фокус');
			})
		}
		let obj = { 'id': cvs, 'cvs': ctx, 'update': temp, 'init': init }
		window.onresize = document.body.onresize = cvs.onresize = resize;
		resize();
		Eng.console.release();
		if (obj.init) obj.init();
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
	'debug': function(arg) { if (cfg.debug) console.log('[DEBUG!]', ...arguments); }
}
/*
	||| add(control) - добавление значения;
	||| clear(control) - очистка значений (без аргументов - полная очистка);
	||| check(control) - провера значения;
*/
let Byte = {
	'key': 0,
	'add': function(arr) {
		for (let i = 0; i < arguments.length; i++)
			this.key |= cfg.macros[arguments[i]];
	},
	'clear': function(arr) {
		if (arguments.length > 0)
			for (let i = 0; i < arguments.length; i++) this.key &=~ cfg.macros[arguments[i]];
		else this.key = 0;
	},
	'check': function(arr) {
		for (let i = 0; i < arguments.length; i++)
			if ((this.key & cfg.macros[arguments[i]]) <= 0) return false;
		return true;
	}
};
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
/*
##################
#\               #   Graphics ( графический модуль )
# \       |      #   rect(x, y, w, h, colour, alpha, type, lw) - рисует прямоугольник;
#  \    -( )-    #   round(x, y, w, h, range, colour, alpha, type, lw) - рисует прямоугольник с скругленными краями;
#   \     |     /#   circle(x, y, radius, start, end, colour, alpha, type, lw) - рисует круг;
#    \         / #   ellipse(x, y, w, h, colour, alpha, type, lw) - рисует элипс;
#     \     __/  #   text(str, x, y, colour, alpha, size, font, type, align, lw) - рисует текст;
#      \   /     #   wtext(str, x, y, width, colour, alpha, size, font, type, lw) - рисует текст с переносом по ширине;
#    ___\_/      #   len(str, size, font) - возвращает длину текста;
#   /            #   image(img, x, y, w, h) - рисует изображение ( для продвинутого функционала используется Img )
##################
*/
class Graphics {
	constructor(cvs) {
		this.cvs = cvs;
		Add.debug('Графический модуль активирован!');
	}
	savemodule(func) {
		let save = {
			'fillStyle': this.cvs.fillStyle, 'strokeStyle': this.cvs.strokeStyle,
			'globalAlpha': this.cvs.globalAlpha, 'lineWidth': this.cvs.lineWidth,
			'font': this.cvs.font
		 };
		 func();
		 Object.keys(save).forEach(key => { this.cvs[key] = save[key]; });
	}
	rect(x, y, w, h, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs[type + 'Rect'](x, y, w, h);
		});
		return { 'x': x, 'y': y, 'w': w, 'h': h };
	}
	round(x, y, w, h, range, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs.beginPath();
				this.cvs.lineTo(x, y + range);
				this.cvs.quadraticCurveTo(x, y, x + range, y);
				this.cvs.lineTo(x + range, y);
				this.cvs.lineTo(x + w - range, y);
				this.cvs.quadraticCurveTo(x + w, y, x + w, y + range);
				this.cvs.lineTo(x + w, y + h - range);
				this.cvs.quadraticCurveTo(x + w, y + h, x + w - range, y + h);
				this.cvs.lineTo(x + w - range, y + h);
				this.cvs.lineTo(x + range, y + h);
				this.cvs.quadraticCurveTo(x, y + h, x, y + h - range);
				this.cvs.lineTo(x, y + h - range);
				this.cvs.lineTo(x, y + range);
				this.cvs[type]();
			this.cvs.closePath();
		});
		return { 'x': x, 'y': y, 'w': w, 'h': h };
	}
	circle(x, y, radius, start, end, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs.beginPath();
				this.cvs.arc(x, y, radius, start, end);
				this.cvs[type]();
			this.cvs.closePath();
		});
	}
	ellipse(x, y, w, h, colour='#000', alpha, type='fill', lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			this.cvs.beginPath();
				this.cvs.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
				this.cvs[type]();
			this.cvs.closePath();
		});
	}
	text(text, x, y, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) {
		this.savemodule(() => {
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (lw != undefined) this.cvs.lineWidth = lw;
			this.cvs[type + 'Style'] = colour;
			if (align) {
				let dt = align.split('-');
				if (dt) {
					if (dt[0]) this.cvs.textAlign = dt[0];
					if (dt[1]) this.cvs.textBaseline = dt[1];
				}
			}
			this.cvs.font = `${size}px ${font}`;
			this.cvs[type + 'Text'](lang.use(text) || text, x, y);
		});
		return this.len(text, size, font);
	}
	wtext(text, x, y, width, colour='#000', alpha, size=10, font='Arial', type='fill', align, lw) {
		let pos = 0, nstr = '', spaces = [];
		if (typeof(text) == 'object') { assoc = text[1], text = (lang.use(text[0]) || text[0]); }
		else text = lang.use(text) || text;
		while (pos < text.length) {
			nstr += text[pos++];
			let w = this.len(nstr, size, font);
			if (w >= width * .675) {
				spaces.push([pos, w]);
				nstr = '';
			}
		}
		if (nstr != '') spaces.push([text.length, this.len(nstr, size, font)]);
		let yy = y;
		if (align) {
			let dt = align.split('-');
			switch(dt[1]) {
				case 'middle': yy = y - (spaces.length * size) * .5; break;
				case 'bottom': yy = y - (spaces.length * size); break;
			}	
		}
		for (let i = 0, offset = 0; i < spaces.length; i++) {
			gr.text(text.slice(offset, spaces[i][0]), x, y + i * size, colour, alpha, size, font, type, align, lw);
			offset = spaces[i][0];
		}
		return { w: spaces[0][1], h: spaces.length * size };
	}
	len(text, size=10, font='Arial') {
		let savefont = this.cvs.font;
			this.cvs.font = size + 'px ' + (font || 'Arial');
			let width = this.cvs.measureText(lang.use(text) || text).width;
		this.cvs.font = savefont;
		return width;
	}
	image(img, x, y, w, h) { if (img) this.cvs.drawImage(img, x, y, w, h); }
}
let Img = {
	'init': function(path, left, top, w, h, xoff, yoff, count) {
		this.path = path, this.image = images[path], this.left = left || 0, this.top = top || 0,
		this.w = w || (this.image.width || 0), this.h = h || this.image.height, this.count = count || 1,
		this.xoff = xoff || 0, this.yoff = yoff || 0, this.frame = 0, this.frame_spd = 1;
		return Eng.copy(this);
	},
	'draw': function(cvs, x, y, w, h, alpha, xscale, yscale, rotate) {
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
};
/*
		  #      _
		 # #    |_|  поиск по объектам:
		#####    |   distance(obj, x, y, range) - ищет объекты obj в точке x,y на дистанции range;
	   #  #  #   |   id(id, id1..n) - ищет объекты по ID;
	  # ##### #--|   search(obj, obj1..n) - ищет объекты obj;
	 #         # |   count(obj, obj1..n) - выводит кол-во объектов obj на уровне;
	   |     |	     key(name, key, value) - выдает все объекты с именем name в которых есть переменная равная value;
*/
let Search = {
	'distance': function(obj, x, y, range, offset) {
		let s = [];
		if (typeof(obj) == 'object') obj.forEach(function(e) { s = s.concat(Search.search(e)); }); else s = Search.search(obj);
		s.sort(function(a, b) { return Eng.math.distance(x, y, a.x + (offset || 0), a.y + (offset || 0)) - Eng.math.distance(x, y, b.x + (offset || 0), b.y + (offset || 0)); });
		if (range != undefined)
			for (let i = 0; i < s.length; i++) {
				if (Eng.math.distance(x, y, s[i].x + (offset || 0), s[i].y + (offset || 0)) >= range) return s.splice(0, i);
			}
		return s;
	},
	'id': function(id) {
		let s = [];
		if (memory.lobjects)
			if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) s = s.concat(Search.id(arguments[i]));
			else {
				let ind = memory.lobjects.findIndex(obj => { return obj.id == id; });
				if (ind != -1) s.push(memory.lobjects[ind]);
			}
		
		if (s.length > 1) return s;
		else if (s.length == 1) return s[0];
		else return false;
	},
	'search': function(obj) {
		let s = [];
		if (memory.lobjects)
			for (let i = 0; i < arguments.length; i++) {
				let arg = arguments[i];
				memory.lobjects.forEach(function(e) {
					if ((e.name == arg) || (arg == 'all')) s.push(e);
				});
			}
		return s;
	},
	'count': function(obj) {
		let count = 0;
		for (let i = 0; i < arguments.length; i++) count += Search.search(arguments[i]).length;
		return count;
	},
	'key': (name, key, value) => {
		let arr = Search.search(name), narr = [];
		if (arr) arr.forEach(obj => {
			if (obj[key] && obj[key] == value) narr.push(obj);
		});
		return narr;
	}
};
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
	//======\\		>> Таймеры >> || >> || >>
   ||    |   ||		— init(seconds, multi=1000) - Запускает таймер (по умолчанию в секундах);
   ||    |   ||		— check(loop) - Проверяет расстояние между временем. (с loop сбрасывает счетчик);
   ||.  _0  .||		- delta() - показывает расстояние между временем от 0 до 1;
   ||    .   ||		— reset(x=0) - сбрасывает счетчик в положение x;
    \\======//		— count() — возвращает кол-во пройденных циклов
*/
class Timer {
	constructor(x, multi=1000) { 
		this.max = x * multi, this.save_max = x, this.point = 0;
		this.reset();
	}
	check(loop) {
		if ((this.point - Date.now()) <= 0) {
			if (!loop) this.reset();
			return true;
		}
		return false;
	}
	delta() { return Eng.math.clamp(Math.max(this.point - Date.now(), 0) / this.max, 0, 1); }
	count() { return Math.floor(Math.abs(this.point - Date.now()) / this.max); }
	reset(x=0) { 
		if (x == 0) this.point = Date.now() + this.max;
		else this.point = x; 
	}
}
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
/* 
	^   система частиц:
   / \	life - период жизни;
   | |  angle_(start/end) - угол перемещения;
   | |	alpha_(start/end) - прозрачность;
   | |	spd - скорость частицы;
   | |	image_index - спрайт для частицы;
   | |		-- методы: --
 0==^==0 init(params, x, y) - загрузка параметров частицы;
    |	 draw() - отрисовка частицы, заносится в основной буффер;
    0	 destroy() - удаляет частицу из стека;
*/
let Part = {
	'init': function(params, x, y, gui) {
		let npt = { 'name': '$part', 'unsave': true, 'gui': gui };
		let pt = Add.object(npt, x, y);
		let keys = Object.keys(params);
		for (let i = 0; i < keys.length; i++) {
			if (keys[i] == 'image_index') {
				pt.image_index = Img.init(params[keys[i]].path, params[keys[i]].left, params[keys[i]].top, params[keys[i]].w, params[keys[i]].h, params[keys[i]].xoff, params[keys[i]].yoff, params[keys[i]].count);
				if (params.image_index && params.frame_spd) {
					pt.image_index.frame_spd = pt.frame_spd;
					if (params.is_randomize) pt.image_index.frame = Math.floor(Math.random() * pt.image_index.count);
					else if (params.frame) pt.image_index.frame = params.frame;
				}
			} else pt[keys[i]] = params[keys[i]];
		}
		if (pt.life) {
			pt.life = new Timer(pt.life);
			pt.life.check();
		}
		if (pt.angle == -1 || pt.angle == undefined) pt.angle = Math.random() * ((pt.angle_end || 0) - (pt.angle_start || 0)) - (pt.angle_end || 0);
		if (pt.alpha == undefined) pt.alpha = pt.alpha_start || pt.alpha_end || 1;
		if (pt.alpha_end == undefined) pt.alpha_end = pt.alpha_start || pt.alpha;
		if (pt.alpha_start == undefined) pt.alpha_start = pt.alpha;
		if (pt.scale == undefined) pt.scale = pt.scale_start || pt.scale_end || 1;
		if (pt.scale_end == undefined) pt.scale_end = pt.scale_start || pt.scale;
		if (pt.scale_start == undefined) pt.scale_start = pt.scale;
		pt.func = function(cvs) {
			if (pt.life) {
				if (pt.life.check(true)) pt.destroy();
				else {
					if (pt) {
						let delta = 1 - pt.life.delta();
						pt.x += Math.cos(Eng.math.torad(pt.angle)) * (pt.spd || 0);
						pt.y += Math.sin(Eng.math.torad(pt.angle)) * (pt.spd || 0);
						pt.image_index.frame_spd = (pt.frame_spd * !pt.is_life) || 0;
						if (pt.is_life) pt.image_index.frame = pt.image_index.count * delta;
						pt.scale = pt.scale_start + (pt.scale_end - pt.scale_start) * delta;
						pt.alpha = pt.alpha_start + (pt.alpha_end - pt.alpha_start) * delta;
						pt.image_index.draw(cvs, pt.x, pt.y, undefined, undefined, pt.alpha, pt.scale, pt.scale, pt.angle);
					}
				}
			} else {
				if (pt.image_index.frame >= pt.image_index.count - pt.frame_spd) pt.destroy();
				if (pt) {
					let delta = 1 - (pt.image_index.frame / pt.image_index.count);
					pt.x += Math.cos(Eng.math.torad(pt.angle)) * (pt.spd || 0);
					pt.y += Math.sin(Eng.math.torad(pt.angle)) * (pt.spd || 0);
					pt.image_index.frame_spd = pt.frame_spd;
					pt.scale = pt.scale_start + (pt.scale_end - pt.scale_start) * delta;
					pt.alpha = pt.alpha_start + (pt.alpha_end - pt.alpha_start) * delta;
					pt.image_index.draw(cvs, pt.x, pt.y, undefined, undefined, pt.alpha, pt.scale, pt.scale, pt.angle);
				}
			}
		}
		pt.draw = function() {
			if (!pt.gui) render[render.length] = { 'obj': pt, 'func': pt.func};
			else add_gui(function(cvs) { pt.func(pt.gui)} );
		}
		pt.destroy = function() {
			pt.DELETED = true;
			if (pt.delete) pt.delete();
			return true;
		}
		return pt;
	}
}
/* работа с сетью: */
let Socket = {
	'init': function(ip, port, func) {
		this.ip = ip, this.port = port || 8080, this.open = false;
		this.socket = new WebSocket("ws://" + ip + ':' + port);
		this.socket.onerror = function(e) { console.log(e.message); }
		this.socket.onopen = function(e) {
			console.log('server connected!');
		}
		this.socket.onmessage = function(e) { func(JSON.parse(e.data)); }
		this.socket.onclose = function(e) {
			if (e.wasClean) console.log('clear disconnect');
			else console.log('not clear disconnect');
			console.log('error', e.code, 'warning', e.reason);
		}
		return this;
	},
	'send': function(type, data) {
		let arr = {'TYPE': type};
		Object.keys(data).forEach(function(e) { arr[e] = data[e]; });
		this.socket.send(JSON.stringify(arr));
	}
}

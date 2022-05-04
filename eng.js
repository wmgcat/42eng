'use strict';

let loaded = 0, mloaded = 0, current_time = 0, current_level = 0, current_camera = 0;
let pause = false, editor = false, mute = false, levelChange = false, is_touch = false;
let errors = [], render = [], gui = [], cameraes = [{'x': 0, 'y': 0}];
let audio = {}, keylocks = {}, grid = {}, levelMemory = {}, memory = {}, images = {};
let zoom = 1, grid_size = 32;
let lang = {'type': 'ru', 'source': {}}, mouse = {'x': 0, 'y': 0, 'touchlist': []}, SETTING = {'music': 1, 'sound': 1};
let version = '1.2';

function show_error(cvs, clr) { // вывод ошибок:
	if (errors.length > 0) {
		if (cvs) {
			cvs.fillStyle = clr || '#fff';
			errors.forEach(function(e, i) {
				add_gui(function(cvs) {
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
function copy(source) {
	let arr = {};
	Object.keys(source).forEach(function(e) { arr[e] = source[e]; });
	return arr;
}
/*
    \0/ ** add content ** \0/
	rule(char, key || object) - добавление клавиш управления;
	script(src, 1..n) - добавление скриптов;
	audio(src, 1..n) - добавление звуков, музыки;
	image(src, 1..n) - добавление изображений;
	error(msg) - создание ошибок;
	canvas(id, update, loading) - создание холста для игры,
		поиск canvas по id,
		в update(t) происходит обновление всех объектов и их отрисовка,
		в loading(loaded, t) экран загрузки;
	object(name, x, y) - добавление копии игрового объекта на уровень;
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
	'audio': function(source) {
		for (let i = 0; i < arguments.length; i++) {
			mloaded++;
			let saudio = new Audio(arguments[i]), path = arguments[i].split('/');
			if (path[0] == '.') path = path.splice(1, path.length - 1);
			path[path.length - 1] = path[path.length - 1].replace('.wav', '');
			saudio.volume = .25;
			saudio.onerror = function() { return Add.error(path + ' not find!'); }
			saudio.onloadeddata = function() { loaded++; }
			audio[path.join('.')] = saudio;
		}
	},
	'image': function(source) {
		for (let i = 0; i < arguments.length; i++) {
			mloaded++;
			let img = new Image(), path = arguments[i].split('/');
			img.src = arguments[i];
			if (path[0] == '.') path = path.splice(1, path.length - 1);
			path[path.length - 1] = path[path.length - 1].replace('.png', '').replace('.jpg', '').replace('.gif', '').replace('.jpeg', '');
			img.onload = function() { loaded++; }
			img.onerror = function() { return Add.error(path + ' not find!'); }
			images[path.join('.')] = img;
		}
	},
	'error': function(msg) {
		errors[errors.length] = msg;
		console.error(msg);
	},
	'canvas': function(id, upd, loading) {
		let cvs = document.getElementById(id), node = cvs.parentNode;
		if (cvs) {
			function keyChecker(e) {
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
			}
			function mouseChecker(e) {
				let xoff = (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove') ? e.offsetX : e.changedTouches[0].clientX,
					yoff = (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove') ? e.offsetY : e.changedTouches[0].clientY;
				mouse.x = cameraes[current_camera].x + xoff;
				mouse.y = cameraes[current_camera].y + yoff;
				switch(e.type) {
					case 'mouseup': case 'touchend':
						is_touch = false;
						Byte.add('uclick');
						cvs.focus();
					break;
					case 'mousedown': case 'touchstart': Byte.add('dclick'); break;
				}
				if (e.type == 'touchstart') is_touch = true;
				e.preventDefault();
			}
			cvs.onmousedown = cvs.onmouseup = cvs.onmousemove = cvs.ontouchstart = cvs.ontouchend = cvs.ontouchmove = mouseChecker;
			function ready() {
				window.addEventListener('keydown', keyChecker);
				window.addEventListener('keyup', keyChecker);
				cvs.focus();
			}
			if (document.readyState == 'loading') document.addEventListener('DOMContentLoaded', ready);
			else ready();
			let ctx = cvs.getContext('2d');
			function temp(t) {
				gui = [];
				if (loaded >= mloaded) {
					ctx.save();
					ctx.fillRect(0, 0, cvs.width, cvs.height);
					ctx.scale(zoom, zoom);
					ctx.translate(-cameraes[current_camera].x / zoom, -cameraes[current_camera].y / zoom);
					upd(t);
					render.sort(function(a, b) { return (a.obj.yr || a.obj.y) - (b.obj.yr || b.obj.y); }).forEach(function(e) {
						if (e.obj.update && !pause) e.obj.update();
						if (!e.obj.is_init && e.obj.initialize && !editor) {
							e.obj.initialize();
							e.obj.is_init = true;
						}
						e.func(ctx);
					});
					ctx.restore();
					render = [];

				} else loading(loaded / mloaded, t);
				try { gui.reverse().forEach(function(e) { e(ctx); }); }
				catch(err) { console.log(err.message); }
				cvs.style.cursor = Byte.check('hover') ? 'pointer' : 'default';
				Byte.clear('hover', 'dclick', 'uclick');
				current_time = t;
				window.requestAnimationFrame(temp);
			}
			let obj = { 'id': cvs, 'cvs': ctx, 'update': temp }
			if (node) {
				function resize() {
					try {
						let tmp = new Image();
						tmp.src = cvs.toDataURL('image/png').replace('image/png', 'image/octet-stream');
						tmp.onload = function() {
							cvs.width = Math.floor(node.clientWidth);
							cvs.height = Math.floor(node.clientHeight);
							obj.ctx = cvs.getContext('2d');
							obj.ctx.imageSmoothingEnabled = false;
							obj.ctx.drawImage(tmp, 0, 0);
						}
					}
					catch(err) { Add.error(err.message); }
					finally {
						cvs.width = Math.floor(node.clientWidth);
						cvs.height = Math.floor(node.clientHeight);
						obj.ctx = cvs.getContext('2d');
						obj.ctx.imageSmoothingEnabled = false;
					}
				}
				window.onresize = node.onresize = resize;
				resize();
			}
			let description = "\n42eng.js by wmgcat!\nmade in javascript.\n\nversion: " + version;
			console.log(description);
			return obj;
		}
	},
	'object': function(obj, x, y) {
		if (typeof(obj) == 'string') {
			if (memory.editor)
				for (let i = 0; i < memory.editor.objects.length; i++) {
					if (obj == memory.editor.objects[i].name) {
						obj = memory.editor.objects[i];
						break;
					}
				}
		}
		obj.x = x || 0, obj.y = y || 0;
		if (memory.lobjects) memory.lobjects[memory.lobjects.length] = copy(obj); else memory.lobjects = [copy(obj)];
		memory.lobjects[memory.lobjects.length - 1].id = '#id' + Date.now();  //(memory.lobjects.length);
		return memory.lobjects[memory.lobjects.length - 1];
	}
}
/*
	||| add(control) - добавление значения;
	||| clear(control) - очистка значений (без аргументов - полная очистка);
	||| check(control) - провера значения;
*/
let Byte = {
	'key': 0, 'list': {
		'up': 1, 'down': 2, 'left': 4, 'right': 8,
		'active': 16, 'mode': 32, 'dclick': 64, 'uclick': 128,
		'move': 256, 'hover': 512
	},
	'add': function(arr) {
		for (let i = 0; i < arguments.length; i++)
			this.key |= this.list[arguments[i]];
	},
	'clear': function(arr) {
		if (arguments.length > 0)
			for (let i = 0; i < arguments.length; i++) this.key &=~ this.list[arguments[i]];
		else this.key = 0;
	},
	'check': function(arr) {
		for (let i = 0; i < arguments.length; i++)
			if ((this.key & this.list[arguments[i]]) <= 0) return false;
		return true;
	}
};
let Eng = {
	'distance': function(x1, y1, x2, y2) { return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)); },
	'direction': function(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); },
	'sign': function(x) { return ((Math.round(x) > 0) - (Math.round(x) < 0)) * (Math.round(x) != 0); },
	'clamp': function(x, min, max) { return Math.min(Math.max(x, min), max); },
	'torad': function(x) { return x * Math.PI / 180; },
	'todeg': function(x) { return x / Math.PI * 180; },
	'collision': {
		'rect': function(px, py, x, y, w, h) { return ((px >= x) && (px <= (x + w)) && (py >= y) && (py <= (y + (h || w)))); },
		'circle': function(px, py, x, y, range) { return distance(px, py, x, y) <= range; }
	}

};
function merge(col1, col2, val) {
	let ncol = '#', table = {'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15};
	for (let i = 1, a, b, ab; i < col1.length; i++) {
		a = (table[col1[i]] || col1[i]) - 0, b = (table[col2[i]] || col2[i]) - 0, ab = clamp(Math.abs(Math.floor(a + (b - a) * val)), 0, 15);
		ncol += Object.keys(table)[ab - 10] || ab;
	}
	return ncol;
}
function rect(x, y, w, h) { return ((mouse.x >= (x * zoom)) && (mouse.x <= ((x + w) * zoom)) && (mouse.y >= (y * zoom)) && (mouse.y <= ((y + (h || w))) * zoom)); }
function point_in_rect(px, py, x, y, w, h) { return ((px >= x) && (px <= (x + w)) && (py >= y) && (py <= (y + (h || w)))); }
function grect(x, y, w, h) {
	if (arguments.length == 1) {
		let arg = x;
		x = arg[0]; y = arg[1]; w = arg[2]; h = arg[3];
	}
	return (mouse.x - cameraes[current_camera].x >= x && mouse.x - cameraes[current_camera].x <= x + w && mouse.y - cameraes[current_camera].y >= y && mouse.y - cameraes[current_camera].y <= y + h);
}
function distance(x1, y1, x2, y2) { return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)); }
function direction(x1, y1, x2, y2) { return Math.atan2(y2 - y1, x2 - x1); }
function sign(x) { return ((Math.round(x) > 0) - (Math.round(x) < 0)) * (Math.round(x) != 0); }
function bsign(bool) { return bool - !bool; };
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
function add_gui(func) { gui[gui.length] = func; }
function sound_play(name, volume, looping) {
	if (audio[name] && !mute) {
		audio[name].volume = volume || audio[name].volume;
		audio[name].play();
		audio[name].loop = looping || false;
	}
}
function sound_stop(name) {
	if (audio[name] && !mute) {
		audio[name].pause();
		audio[name].currentTime = 0;
	}
}
let Obj = {
	'init': function(name) {
		if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) this.init(arguments[i]);
		else {
			this.x = 0, this.y = 0, this.name = name || 'undefined',
			this.image_index = 0;
			let obj = copy(this);
			if (memory.editor) memory.editor.objects[memory.editor.objects.length] = obj;
			else memory.editor = { 'objects': [obj] };
			return obj;
		}
	},
	'draw': function(func) { if (func) render[render.length] = { 'obj': this, 'func': func }; },
	'destroy': function() {
		if (memory.lobjects)
			for (let i = 0; i < memory.lobjects.length; i++) {
				if (memory.lobjects[i] == this) {
					if (this.delete) this.delete();
					delete memory.lobjects[i];
					return true;
				}
			}
		return false;
	}
};
let Map = {
	'init': function(w, h, x, y) {
		this.grid = [], this.memory = {}, this.w = w, this.h = h,
		this.x = x || 0, this.y = y || 0, this.yr = -100;
		for(let i = 0; i < w; i++) {
			this.grid[i] = [];
			for(let j = 0; j < h; j++) this.grid[i][j] = 0;
		}
		return copy(this);
	},
	'set': function(i, j, val) {
		try { this.grid[i][j] = val || 0; }
		catch(err) { Add.error(err.message); }
	},
	'registry': function(val, value, img) { 
		if (!img) this.memory[val] = value;
		else this.memory[val] = [value, img];
	},
	'draw': function(func) {
		if (func) render[render.length] = { 'obj': {'yr': -1000}, 'func': func };
	},
	'get': function(i, j) {
    try { return Math.floor(this.grid[i - this.x][j - this.y]); }
    catch(err) { Add.error(err.message); }
  },
	'path': function(i, j, ni, nj) {
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
						if (!find) rpoints[rpoints.length] = [distance(xx, yy, ni, nj), xx, yy];
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
	},
	'render3D': function(x, y, angle, step, gr, width, height, texts) {
		if (!pause) {
			let stack = [], col = 60 / width, ids = {}, range = width / 60;
			for (let i = 60; i > -1; i -= col) { // angle:
				let n_dir = angle - 60 * .5 + i;
				for (let d = 0; d < width / height * grid_size * 4; d++) { // distance:
					let xx = x + Math.cos(n_dir / 180 * Math.PI) * d, yy = y + Math.sin(n_dir / 180 * Math.PI) * d;
					if (this.grid[Math.floor(xx / grid_size)][Math.floor(yy / grid_size)] != 0) {
						let h = height * (grid_size / Math.abs(Math.sqrt(Math.pow(xx - x, 2) + Math.pow(yy - y, 2)) * Math.cos((n_dir - angle) / 180 * Math.PI))),
							xo = 0, yo = 0,
							offset = distance(xx, yy, Math.floor(xx / grid_size + xo) * grid_size, Math.floor(yy / grid_size + yo) * grid_size);
						if (offset > (grid_size - 1)) xo = yo = 1;
						offset = distance(xx, yy, Math.floor(xx / grid_size + xo) * grid_size, Math.floor(yy / grid_size + yo) * grid_size);
						stack[stack.length + 1] = {
							'x': i * range, 'y': (height - h) * .5,
							'left': offset % (grid_size - col),
							'dist': h, 'ind': this.grid[Math.floor(xx / grid_size)][Math.floor(yy / grid_size)]
						};
						break;
					}
					for (let j = 0; j < memory.lobjects.length; j++) { // place on object:
						let ndist = distance(xx, yy, memory.lobjects[j].x + grid_size * .5, memory.lobjects[j].y + grid_size * .5);
						if (ndist < step) {
							let h = height * (grid_size / Math.abs(Math.sqrt(Math.pow(xx - x, 2) + Math.pow(yy - y, 2)) * Math.cos((n_dir - angle) / 180 * Math.PI)));
							if (ids[memory.lobjects[j].id] == undefined) {
								stack[stack.length + 1] = {
									'x': i * range, 'y': (height - h) * .5,
									'dist': h, 'type': 'obj',
									'obj': memory.lobjects[j],
									'view': Math.abs((memory.lobjects[j].angle || 0) - n_dir)
								};
								ids[memory.lobjects[j].id] = true;
							}
						}
					}
				}
			}
			stack.sort(function(a, b) { return (a.type == 'obj') - (b.type == 'obj'); }).sort(function(a, b) { return a.dist - b.dist; }).forEach(function(e) {
				if (e.type == 'obj') {
					if (texts[e.obj.name] != undefined) {
						if (texts[e.obj.name] != 'none') {
							let dist = e.view;
							if (dist > 45 && dist < 135) gr.image(images[texts[e.obj.name]], e.x - grid_size * .5, e.y, e.dist, e.dist, 1, 32, 0, 32, 32);
							else if (dist > 225 && dist < 315) gr.image(images[texts[e.obj.name]], e.x - grid_size * .5, e.y, e.dist, e.dist, 1, 96, 0, 32, 32);
							else if (dist >= 135 && dist <= 225) gr.image(images[texts[e.obj.name]], e.x - grid_size * .5, e.y, e.dist, e.dist, 1, 64, 0, 32, 32);
							else gr.image(images[texts[e.obj.name]], e.x - grid_size * .5, e.y, e.dist, e.dist, 1, 0, 0, 32, 32);
						}
					} else gr.rect(e.x - grid_size * .5, e.y, e.dist, e.dist, merge('#f0f', '#000', 1 - e.dist / 50));
				} else {
					if (texts[e.ind + ''] != undefined) {
						gr.image(images[texts[e.ind]], e.x, e.y, range, e.dist, 1, e.left, 0, col, grid_size);
					}
					gr.rect(e.x, e.y, range, e.dist, '#000', clamp(1 - e.dist / 300, 0, 1));
				}
			});
		}
	}
};
let Graphics = {
	'init': function(cvs) {
		this.cvs = cvs;
		return copy(this);
	},
	'getColor': function(x, y) {
		try {
			let dt = this.cvs.getImageData(x, y, 1, 1).data;
			return '#' + ('000000' + (((dt[0] << 16) | (dt[1] << 8) | dt[2]).toString(16)).slice(-6));
		}
		catch(err) { return '#000'; }
	},
	'rect': function(x, y, w, h, color, alpha, tp) {
		if (color) this.cvs[(tp || 'fill') + 'Style'] = color;
		if (alpha != undefined) this.cvs.globalAlpha = alpha;
		if (tp) this.cvs[tp + 'Rect'](x, y, w, h); else this.cvs.fillRect(x, y, w, h);
		if (alpha != undefined) this.cvs.globalAlpha = 1;
		return [x, y, w, h];
	},
	'text': function(text, x, y, color, alpha, size, font, tp, align) {
		this.cvs.save()
			if (align) { // change text position:
				let dt = align.split('-');
				if (dt) {
					if (dt[0]) this.cvs.textAlign = dt[0];
					if (dt[1]) this.cvs.textBaseline = dt[1];
				}
			}
			if (size) this.cvs.font = size + 'px ' + (font || 'Arial');
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			if (color) this.cvs[(tp || 'fill') + 'Style'] = color;
			this.cvs[(tp || 'fill') + 'Text'](text, x, y);
		this.cvs.restore();
	},
	'len': function(text, size, font) {
		this.cvs.save();
			if (size) this.cvs.font = size + 'px ' + (font || 'Arial');
			let width = this.cvs.measureText(text).width;
		this.cvs.restore();
		return width;
	},
	'triangle': function(x1, y1, x2, y2, x3, y3, color, alpha) {
		if (color) this.cvs.fillStyle = color;
		this.cvs.beginPath();
		this.cvs.lineTo(x1, y1);
		this.cvs.lineTo(x2, y2);
		this.cvs.lineTo(x3, y3);
		this.cvs.closePath();
		this.cvs.fill();
	},
	'line': function(x, y) {
		this.cvs.beginPath();
		if (arguments.length > 2) {
			for (let i = 0; i < arguments.length; i += 2) this.cvs.lineTo(arguments[i], arguments[i + 1]);
		} else this.cvs.lineTo(x, y);
		this.cvs.closePath();
		this.cvs.stroke();
	},
	'circle': function(x, y, range, a, b, color, alpha, tp) {
		if (color) this.cvs[(tp || 'fill') + 'Style'] = color;
		if (alpha != undefined) this.cvs.globalAlpha = alpha;
		this.cvs.beginPath();
		this.cvs.arc(x, y, range, a, b);
		this.cvs.closePath();
		this.cvs[tp || 'fill']();
		if (alpha != undefined) this.cvs.globalAlpha = 1;
	},
	'round': function(x, y, w, h, range, color, alpha, tp) {
		if (alpha != undefined) this.cvs.globalAlpha = alpha;
		if (color) this.cvs.fillStyle = color;
		this.cvs.beginPath();
			this.cvs.rect(x + range, y, w - range * 2, h);
			this.cvs.rect(x, y + range, w, h - range * 2);
			this.cvs.lineTo(x, y + range);
			this.cvs.lineTo(x + range, y);
			this.cvs.lineTo(x + w - range, y);
			this.cvs.lineTo(x + w, y + range);
			this.cvs.lineTo(x + w, y + h - range);
			this.cvs.lineTo(x + w - range, y + h);
			this.cvs.lineTo(x + range, y + h);
			this.cvs.lineTo(x, y + h - range);
			this.cvs.moveTo(x, y + range);
			this.cvs.quadraticCurveTo(x, y, x + range, y);
			this.cvs.moveTo(x + w - range, y);
			this.cvs.quadraticCurveTo(x + w, y, x + w, y + range);
			this.cvs.moveTo(x + w, y + h - range);
			this.cvs.quadraticCurveTo(x + w, y + h, x + w - range, y + h);
			this.cvs.moveTo(x, y + h - range);
			this.cvs.quadraticCurveTo(x, y + h, x + range, y + h);
			if (tp) this.cvs[tp](); else this.cvs.fill();
		this.cvs.closePath();
		if (alpha != undefined) this.cvs.globalAlpha = 1;
		return [x, y, w, h];
	},
	'image': function(img, x, y, w, h, alpha, left, top, ws, hs) { // старый метод для рисовки изображений.
		this.cvs.save();
			if (alpha != undefined) this.cvs.globalAlpha = alpha;
			let src = img, nleft = left || 0, ntop = top || 0, wi = ws || src.width, hi = hs || src.height;
			this.cvs.drawImage(src, nleft, ntop, wi, hi, x, y, w || src.width, h || src.height);
			if (alpha != undefined) this.cvs.globalAlpha = 1;
		this.cvs.restore();
	},
	'gui': {
		'btn': function(x, y, w, h, col, img) {
			let hover = false, clicked = false;
			if (grect(x, y, w, h) && !Byte.check('hover')) {
				Byte.add('hover');
				hover = true;
				if (Byte.check('uclick')) {
					clicked = true;
					Byte.clear('uclick');
				}
			}
			Graphics.rect(x, y, w, h * .975, merge(col, '#000000', hover * .1));
			if (!hover || !Byte.check('uclick')) Graphics.rect(x, y + h * .95, w, h * .05, merge(col, '#000000', .3 + hover * .1));
			if (img) {
				if (typeof(img) == 'function') {
					Graphics.cvs.save();
					Graphics.cvs.translate(x, y);
					img(Graphics.cvs, hover, clicked);
					Graphics.cvs.restore();
				} else img.draw(Graphics.cvs, x + (w - img.w) * .5, y + (h - img.h) * .5, w, h);
			}
			return clicked;
		},
		'stick': function(x, y, range, val) {
			Graphics.circle(x, y, range - 8, 0, Math.PI * 2, '#470009', .2);
			Graphics.cvs.lineWidth = 8;
			Graphics.circle(x, y, range, 0, Math.PI * 2, '#470009', .25, 'stroke');
			let dist = clamp(distance(val.x, val.y, mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y), -range, range),
				dir = direction(val.x, val.y, mouse.x - cameraes[current_camera].x, mouse.y - cameraes[current_camera].y);
			Graphics.circle(x + dist * Math.cos(dir), y + dist * Math.sin(dir), Math.max(range * .5 * (dist / range), range * .35), 0, Math.PI * 2, '#470009', .2);
			Graphics.cvs.lineWidth = 1;
			return [dir, dist / range];
		},
		'dragWindow': function(id, x, y, w, h, header, content, headcol) {
			if (!memory['window.' + id]) { // initialize window data:
				memory['window.' + id] = {
					'open': true,
					'x': x, 'y': y
				};
			}
			if (header != undefined) {
				Graphics.rect(memory['window.' + id].x, memory['window.' + id].y - h * .1, w, h * .1, headcol ? headcol : '#470009');
				Graphics.text(header, memory['window.' + id].x + w * .05, memory['window.' + id].y - w * .05, '#fff', 1, 12);
				if (grect(memory['window.' + id].x + w * .8, memory['window.' + id].y - h * .1, w * .2, h * .1)) {
					if (Byte.check('uclick') && !Byte.check('hover')) {
						memory['window.' + id].open =! memory['window.' + id].open;
						Byte.clear('uclick');
					}
					Byte.add('hover');
				}
			}
			if (content != undefined && memory['window.' + id].open) {
				Graphics.rect(memory['window.' + id].x, memory['window.' + id].y, w, h, '#330115', .8);
				Graphics.cvs.save();
				Graphics.cvs.translate(memory['window.' + id].x, memory['window.' + id].y);
				content(memory['window.' + id].x, memory['window.' + id].y, w, h);
				Graphics.cvs.restore();
			}

		}
	}
};
let Img = {
	'init': function(path, left, top, w, h, xoff, yoff, count) {
		this.path = path, this.image = images[path], this.left = left || 0, this.top = top || 0,
		this.w = w || (this.image.width || 0), this.h = h || this.image.height, this.count = count || 1,
		this.xoff = xoff || 0, this.yoff = yoff || 0, this.frame = 0, this.frame_spd = 1;
		return copy(this);
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
		} catch(err) {
			Add.error(this.path + ': ' + err.message + '\ndata: ' + this.image);
			this.init(this.path, this.left, this.top, this.w, this.h, this.xoff, this.yoff, this.count);
		}
	}
};
/*
		  #      _
		 # #    |_|  поиск по объектам:
		#####    |   distance(obj, x, y, range) - ищет объекты obj в точке x,y на дистанции range;
	   #  #  #   |   id(id, id1..n) - ищет объекты по ID;
	  # ##### #--|   search(obj, obj1..n) - ищет объекты obj;
	 #         # |   count(obj, obj1..n) - выводит кол-во объектов obj на уровне;
	#############|   find(obj) - выводит номер объекта из таких же объектов как и он;
	   |     |
*/
let Search = {
	'distance': function(obj, x, y, range, offset) {
		let s = [];
		if (typeof(obj) == 'object') obj.forEach(function(e) { s = s.concat(Search.search(e)); }); else s = Search.search(obj);
		s.sort(function(a, b) { return distance(x, y, a.x + (offset || 0), a.y + (offset || 0)) - distance(x, y, b.x + (offset || 0), b.y + (offset || 0)); });
		if (range != undefined)
			for (let i = 0; i < s.length; i++) {
				if (distance(x, y, s[i].x + (offset || 0), s[i].y + (offset || 0)) >= range) return s.splice(0, i);
			}
		return s;
	},
	'id': function(id) {
		let s = [];
		if (memory.lobjects)
			if (arguments.length > 1) for (let i = 0; i < arguments.length; i++) s = s.concat(Search.id(arguments[i]));
			else {
				for (let i = 0; i < memory.lobjects.length; i++)
					if (memory.lobjects[i].id == id) {
						s[s.length] = memory.lobjects[i];
						break;
					}
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
					if (e.name == arg) s[s.length] = e;
				});
			}
		return s;
	},
	'count': function(obj) {
		let count = 0;
		for (let i = 0; i < arguments.length; i++) count += Search.search(arguments[i]).length;
		return count;
	},
	'find': function(obj) {
		let arr = search(obj.name);
		for (let i = arr.length; i > -1; i--)
			if (arr[i] == obj) return i;
		return -1;
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
		let main = copy(this);
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
				if (run) for (let i = 0; i < main.textmap.length; i++) map.registry(main.textmap[i][0], main.textmap[i][1], Img.init(main.textmap[i][2], main.textmap[i][3], main.textmap[i][4], grid_size, grid_size));
			}
			if (datapack.ost) main.ost = datapack.ost;
			if (run) main.load(main.location || main.levels[Object.keys(main.levels)[0]], map);
			levelMemory[src] = copy(main);
			loaded++;
		}
		script.onerror = function() { return Add.error(src + ' не найден!'); }
		document.body.appendChild(script);
	},
	'load': function(id, map, changemap, saved) {
		if (this.levels[id]) {
			if (!changemap && !saved) this.save();
			this.location = id;
			memory.lobjects = [], levelChange = true;
			this.levels[id].objects.forEach(function(e) {
				if (e != null) {
					let obj = Add.object(Obj, e.x, e.y);
					Object.keys(e).forEach(function(f) { obj[f] = e[f]; });
					obj.loadedevent = true;
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
				if (current_level.textmap) for (let i = 0; i < current_level.textmap.length; i++) map.registry(current_level.textmap[i][0], current_level.textmap[i][1], Img.init(current_level.textmap[i][2], current_level.textmap[i][3], current_level.textmap[i][4], grid_size, grid_size));
				current_level.load(sublocation || current_level.location, map, true);
			} else {
				if (this.levels[id]) {
					map.memory = {};
					if (current_level.textmap) for (let i = 0; i < current_level.textmap.length; i++) map.registry(current_level.textmap[i][0], current_level.textmap[i][1], Img.init(current_level.textmap[i][2], current_level.textmap[i][3], current_level.textmap[i][4], grid_size, grid_size));
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
let Timer = {
	'init': function(value) {
		this.start = 0, this.max = value * 30;
		return copy(this);
	},
	'check': function(loop) {
		if (this.start <= 0) {
			this.start = Date.now();
		} else {
			if (((this.start + this.max) - Date.now()) <= 0) {
				if (!loop) this.start = 0;
				return true;
			}
		}
		return false;
	},
	'set': function(value) { this.max = value * 30; },
	'get': function() { return this.max / 30; },
	'delta': function() { return clamp(Math.max((this.start + this.max) - Date.now(), 0) / this.max, 0, 1); }
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
		let pt = copy(this);
		pt.name = '$part', pt.unsave = true, pt.id = Math.random() * 9999999, pt.gui = gui;
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
			pt.life = Timer.init(pt.life);
			pt.life.check();
		}
		if (params.scale == undefined) pt.scale = 1;
		if (params.scale_start == undefined) pt.scale_start = pt.scale;
		if (params.scale_end == undefined) pt.scale_end = pt.scale_start;
		return Add.object(pt, x, y);
	},
	'draw': function(obj) {
		function func(cvs) {

			if (obj.life.check(true)) { // destroy;
				obj.destroy();
			} else {
				if (obj.angle == undefined || obj.angle == -1) {
					obj.angle = Math.random() * (obj.angle_end - obj.angle_start) - obj.angle_end;
				}
				if (obj.alpha == undefined) {
					obj.alpha = obj.alpha_start || obj.alpha_end || 1;
					if (obj.alpha_end == undefined) obj.alpha_end = obj.alpha_start || obj.alpha;
					if (obj.alpha_start == undefined) obj.alpha_start = obj.alpha;
				}
				if (obj.scale == undefined) {
					obj.scale = obj.scale_start || obj.scale_end || 1;
					
				}
				if (obj.scale_end == undefined) obj.scale_end = obj.scale_start || obj.scale || 0;
				if (obj.scale_start == undefined) obj.scale_start = obj.scale || 0;
				obj.x += Math.cos((obj.angle || 0) * Math.PI / 180) * obj.spd;
				obj.y += Math.sin((obj.angle || 0) * Math.PI / 180) * obj.spd;
				if (obj.is_life) {
					obj.image_index.frame_spd = 0;
					obj.image_index.frame = (obj.image_index.count) * (1 - obj.life.delta());
					//console.log(obj.image_index.frame)
				} else {
					obj.image_index.frame_spd = obj.frame_spd || 0;
				}
				obj.alpha = obj.alpha_start + (obj.alpha_end - obj.alpha_start) * (1 - obj.life.delta());
				obj.scale = obj.scale_start + (obj.scale_end - obj.scale_start) * (1 - obj.life.delta());
				obj.image_index.draw(cvs, obj.x, obj.y, undefined, undefined, obj.alpha, obj.scale, obj.scale);
			}
		}
		if (!obj.gui) render[render.length] = { 'obj': this, 'func': func}; else add_gui(function(cvs) { func(obj.gui)} );
	},
	'destroy': function() {
		if (memory.lobjects)
			for (let i = 0; i < memory.lobjects.length; i++) {
				if (memory.lobjects[i] == this) {
					if (this.delete) this.delete();
					delete memory.lobjects[i];
					return true;
				}
			}
		return false;
	}
}
function emitter(params, x, y, count, range, gui) {
	for (let i = 0; i < count; i++) Part.init(params, x + Math.random() * (range * 2) - range, y + Math.random() * (range * 2) - range, gui);
}
// camera work:
function getWindowSize(canvas) { return {'w': canvas.id.width, 'h': canvas.id.height}; }
// localization:
function addLocal(path, type, selected) {
	let script = document.createElement('script');
	script.src = path;
	mloaded++;
	script.onload = function() { 
		lang.source[type] = copy(Lang);
		if (selected) lang.type = type;
		loaded++;

	}
	script.onerror = function() { return Add.error(path + 'не найден!'); }
	document.body.appendChild(script);
}
function trText() {
	let str = false;
	for (let i = 0; i < arguments.length; i++) {
		if (!i) {
			let path = arguments[i].split('.'), pos = 0, arr = lang.source[lang.type] || {};
			while(arr[path[pos]]) {
				if (typeof(arr[path[pos]]) == 'string') {
					str = arr[path[pos]];
					break;
				} else arr = arr[path[pos++]];
			}
		} else str = str.replace('%s', arguments[i]);
	}
	return str;
}
function globalSave(oData) {
	let data = {}, k = Object.keys(oData || {});
	k.forEach(function(e) { data[e] = oData[e]; });
	current_level.save();
	data.levels = {};
	Object.keys(levelMemory).forEach(function(e) {
		data.levels[e] = {}
		Object.keys(levelMemory[e]).forEach(function(j) {
			if (typeof(levelMemory[e][j]) != 'function')
				data.levels[e][j] = levelMemory[e][j];
		});
	});
	//data.levels = levelMemory;
	data.lobjects = memory.lobjects;
	//console.log(current_level);
	Object.keys(levelMemory).forEach(function(e) {
		if (e == current_level.path) {
			data.current_level = [e, current_level.location];
			//console.log(e);
		}
	});
	//data.current_level = current_level.location;
	function circlularReplace() {
		const seen = new WeakSet();
		return function(key, value) {
			if (typeof(value) == 'object' && value !== null) {
				if (seen.has(value)) return;
				seen.add(value);
			}
			return value;
		}
	}
	localStorage.setItem('saver', JSON.stringify(data, circlularReplace()));
}
function globalLoad(func, ignore, destroy) {
	let dt = JSON.parse(localStorage.getItem('saver'));
	if (dt) {
		if (dt.levels) {
			Object.keys(dt.levels).forEach(function(e) {
				Object.keys(dt.levels[e]).forEach(function(f) {
					levelMemory[e][f] = dt.levels[e][f];
					if (f == 'levels') {
						console.log(levelMemory[e][f], dt.levels[e][f]);
						//console.log(levelMemory[e][f]);
						Object.keys(levelMemory[e][f]).forEach(function(g) {
							if (levelMemory[e][f][g].objects) {
								//console.log(levelMemory[e][f][g].objects);
								levelMemory[e][f][g].objects.forEach(function(k) {
									if (k && typeof(k.image_index) != 'string') delete k.image_index;
								});
							}	
						});
					}
				});
			});
			current_level.load(dt.current_level[0] + "|" + dt.current_level[1], nmap, true, true);

			dt.lobjects.forEach(function(e) {
				if (e) {
					let f = Search.id(e.id);
					if (!f) f = Add.object(e.name, e.x, e.y);
					//if (e.name == 'trigger') console.log(f, e);
					Object.keys(e).forEach(function(j) {
						let accept = true;
						for (let i = 0; i < (ignore || []).length; i++) {
							if (ignore[i] == j) {
								accept = false;
								break;
							}
						}
						for (let i = 0; i < (destroy || []).length; i++) {
							if (destroy[i] == j) {
								delete f[j];
								accept = false;
								break;
							}
						}
						if (accept) f[j] = e[j];
					});
				}
			});
		}
		if (func) func(dt);
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
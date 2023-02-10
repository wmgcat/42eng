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

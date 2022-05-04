/// editor:
function Editor(cvs, src, map) {
	let msize = src.height * .05, offset = src.height * .01, gr = Graphics.init(cvs);
	CONST = {
		'wall': 0,
		'floor': 1,
		'steps': .001
	};
	
	add_gui(function(cvs) {
		if (Byte.check('dclick') && !Byte.check('hover') && !memory.creplace) {
			memory.save_mx = mouse.x * zoom, memory.save_my = mouse.y * zoom;
			memory.creplace = true;
			if (memory.editor.dobj) delete memory.editor.dobj;
			Byte.clear('dclick');
		}
		if (memory.creplace) {
			cameraes[current_camera].x += (memory.save_mx - mouse.x * zoom) * .1;
			cameraes[current_camera].y += (memory.save_my - mouse.y * zoom) * .1;
			if (Byte.check('uclick')) {
				delete memory.creplace;
				Byte.clear('uclick');
			}
		}
	});
	if (memory.editor && pause) {
		msize = msize * 2;
		if (memory.lobjects && memory.editor.window == 'objects') {
			for (let i = 0, obj; i < memory.lobjects.length; i++) { 
				obj = memory.lobjects[i];
				if (obj)
					if (rect(obj.x, obj.y, grid_size) && !(Byte.check('hover') || memory.creplace)) {
						Byte.add('hover');
						if (Byte.check('dclick')) {
							memory.editor.dobj = obj;
							Byte.clear('dclick');
							break;
						}
					}
			}
			if (memory.editor.dobj) {
				let dobj = memory.editor.dobj, list = Object.keys(dobj),
				    xx = 4, yy = 4, yoffset = 4;
				list[list.length] = 'delete';
				add_gui(function(cvs) {
					let xx = src.width * .75, ny = src.height * .075;
					gr.rect(xx, ny, src.width * .25, src.height * .925, '#000', .75);
					list.forEach(function(e, i) {
						gr.text(e, xx, ny + (20 + yoffset) * (i + 1), i != list.length - 1 ? '#fff' : '#f00', 1, 18);
						if (grect(xx, ny + yy + (20 + yoffset) * i, grid_size * 5, 20) && !Byte.check('hover')) {
							gr.rect(xx, ny + yy + (20 + yoffset) * i, grid_size * 5, 20 + yy * 2, '#fff', .2);
							if(Byte.check('uclick')) {
								if (i == list.length - 1) {
									memory.editor.dobj.destroy();
									delete memory.editor.dobj;
								} else {
									let q = prompt(e + ':', memory.editor.dobj[e]);
									if (q) {
										if (q[0] >= '0' && q[0] <= '9') memory.editor.dobj[e] = q - 0;
										else memory.editor.dobj[e] = q;
									}
								}
								Byte.clear('uclick');
							}
							Byte.add('hover');
						}
					});
				});
			}
		}
		switch (memory.editor.window) {
			case 'objects':
				add_gui(function(cvs) {
					cvs.textBaseline = 'middle';
					gr.gui.dragWindow('object', offset, src.height * .075 + offset * 5, (msize + offset) * 2 + offset * 5, (msize + offset * 3) * 3 + offset, 'objects', function(left, top) {
						for (let i = (memory.editor_obj_page || 0) * 6, e; i < Math.min((memory.editor_obj_page || 0) * 6 + 6, memory.editor.objects.length); i++) {
							e = memory.editor.objects[i];
							let xx = offset + (msize + offset) * (i % 2), yy = offset + (msize + offset * 3) * Math.floor(i / 2) - (msize + offset * 3) * (memory.editor_obj_page || 0) * 3;
							if (e.image_index) {
								if (typeof(e.image_index) == 'object') {
									cvs.save();
										cvs.translate(xx + msize * .5, yy + msize * .5);
										e.image_index.draw(cvs, 0, 0, msize, msize);
									cvs.restore();
								}
							} else {
								cvs.fillStyle = e.colour || '#fff';
								cvs.fillRect(xx, yy, msize, msize);
							}
							cvs.textAlign = 'center';
							gr.text(e.name, xx + msize * .5, yy + msize + offset * 2, memory.editor_obj == e ? '#ff0' : '#fff', 1, 16);
							cvs.textAlign = 'left';
							if (grect(xx + left, yy + top, msize, msize) && !Byte.check('hover') && !memory.creplace) {
								Byte.add('hover');
								if (Byte.check('dclick')) {
									memory.editor_obj = e;
									Byte.clear('dclick');
								}
							}
						}
					}, '#62ab4a');
					if (memory.editor.objects.length > 6) {
						if ((memory.editor_obj_page || 0) < Math.floor(memory.editor.objects.length / 6))
							if (grect(gr.rect((msize + offset) * 2 + offset * 4, src.height * .075 + offset * 5, offset * 2, (msize + offset * 3) * 3 + offset, '#000', .25)) && !Byte.check('hover') && !memory.creplace) {
								Byte.add('hover');
								if (Byte.check('uclick')) {
									memory.editor_obj_page = (memory.editor_obj_page || 0) + 1;
									Byte.clear('uclick');
								}
							}
					}
					if (memory.editor_obj_page > 0) {
						if (grect(gr.rect(offset, src.height * .075 + offset * 5, offset * 2, (msize + offset * 3) * 3 + offset, '#000', .25)) && !Byte.check('hover') && !memory.creplace) {
							Byte.add('hover');
							if (Byte.check('uclick')) {
								memory.editor_obj_page = (memory.editor_obj_page || 0) - 1;
								Byte.clear('uclick');
							}
						}
					}
				});
				if (memory.editor_obj) {
					let xx = mouse.x, yy = mouse.y, e = memory.editor_obj;
					add_gui(function(cvs) {
						if (e.image_index) {
							if (typeof(e.image_index) == 'object') e.image_index.draw(cvs, xx - cameraes[current_camera].x, yy - cameraes[current_camera].y, msize, msize);
						} else {
							cvs.fillStyle = e.colour || '#fff';
							cvs.fillRect(xx - cameraes[current_camera].x, yy - cameraes[current_camera].y, msize, msize);
						}
					});
					if (Byte.check('uclick')) {
						Add.object(memory.editor_obj, Math.floor(xx / zoom / grid_size) * grid_size, Math.floor(yy / zoom / grid_size) * grid_size);
						delete memory.editor_obj;
						Byte.clear('uclick');
					}
				}
			break;
			case 'tiles':
				add_gui(function(cvs) {
					gr.gui.dragWindow('tiles', offset, src.height * .075 + offset * 5, (msize + offset) * 5 + offset * 5, (msize + offset * 3) * 3 + offset, 'tiles', function(left, top, w, h) {
						cvs.textBaseline = 'top';
						if (!memory.editor_obj) {
							let l = Object.keys(images), size = 8;
							for (let i = (memory.editor_obj_page || 0) * size, e; i < Math.min((memory.editor_obj_page || 0) * size + size, l.length); i++) {
								gr.text(l[i], 26, (i - size * (memory.editor_obj_page || 0)) * 24, '#fff');
								if (grect(left + 16, top + (i - size * (memory.editor_obj_page || 0)) * 24, 100, 24) && !Byte.check('hover')) {
									Byte.add('hover');
									gr.rect(16, (i - size * (memory.editor_obj_page || 0)) * 24, 100, 24, '#fff', .25);
									if (Byte.check('dclick')) {
										delete memory.select_tile;
										memory.editor_obj = l[i];
										Byte.clear('dclick');
									}
								}
							}
							if (l.length > size) {
								if ((memory.editor_obj_page || 0) < Math.floor(l.length / size))
									if (grect(gr.rect((msize + offset) * 5 + offset * 3, 0, offset * 2, (msize + offset * 3) * 3 + offset, '#000', .25)) && !Byte.check('hover') && !memory.creplace) {
										Byte.add('hover');
										if (Byte.check('uclick')) {
											memory.editor_obj_page = (memory.editor_obj_page || 0) + 1;
											Byte.clear('uclick');
										}
									}
							}
							if (memory.editor_obj_page > 0) {
								if (grect(gr.rect(offset, 0, offset * 2, (msize + offset * 3) * 3 + offset, '#000', .25)) && !Byte.check('hover') && !memory.creplace) {
									Byte.add('hover');
									if (Byte.check('uclick')) {
										memory.editor_obj_page = (memory.editor_obj_page || 0) - 1;
										Byte.clear('uclick');
									}
								}
							}
						} else {
							gr.text('back', 10, 0, '#fff');
							let height, ceil = grid_size, gridzoom = grid_size * zoom;
							if (memory.editor_obj != 'clear') {
								let round = [Math.min(images[memory.editor_obj].width * zoom, w), Math.min(images[memory.editor_obj].height * (Math.min((images[memory.editor_obj].width * zoom, w)) / (images[memory.editor_obj].width * zoom)) * zoom, grid_size * 5 * zoom)];
								ceil = Math.floor(round[0] / (images[memory.editor_obj].width / grid_size));
								height = Math.floor((images[memory.editor_obj].height) / grid_size) * ceil;
								gr.image(images[memory.editor_obj], 0, 24, round[0], height);
								//height = images[memory.editor_obj].height * zoom;
								//gr.image(images[memory.editor_obj], 0, 24, images[memory.editor_obj].width * zoom, height);
							} else height = 0;
							for (let i = 0, place = ['wall', 'floor', 'clear']; i < 3; i++) {
								gr.text(place[i], 10, height + 48 + 24 * i, '#fff');
								if (memory.select_tile && memory.select_tile.type == place[i]) gr.rect(0, 48 + 24 * i, 100, 24, '#ff0', .25);
								if (grect(left, top + height + 48 + 24 * i, 100, 24) && !Byte.check('hover')) {
									Byte.add('hover');
									gr.rect(0, height + 48 + 24 * i, 100, 24, '#fff', .25);
									if (Byte.check('dclick')) {
										if (!memory.select_tile) memory.select_tile = {};
										if (place[i] != 'clear') memory.select_tile.type = place[i]; else {
											memory.editor_obj = 'clear';//['clear', nmap.memory['clear']];
										}
										Byte.clear('dclick');
									}
								}
							}
							switch(memory.editor_obj) {
								case 'clear':
									if (Byte.check('dclick') && !Byte.check('hover')) {
										let xx = Math.floor(mouse.x / zoom / grid_size), yy = Math.floor(mouse.y / zoom / grid_size), e = memory.editor_obj;
										val = CONST['wall'];
										//if (!nmap.memory[memory.editor_obj + nx + 'x' + ny]) nmap.registry(memory.editor_obj + nx + 'x' + ny, val, Img.init(memory.editor_obj, memory.select_tile.x * grid_size, memory.select_tile.y * grid_size, grid_size, grid_size));
										
										nmap.set(xx, yy, val);
										//console.log(memory.editor_obj + nx + 'x' + ny, memory.select_tile.x, memory.select_tile.y, nmap.memory[memory.editor_obj + nx + 'x' + ny][0]);
										console.log(xx, yy, nmap.get(xx, yy));
										memory.creplace = false;
									}
								break;
								default:
									if (grect(left, top + 24, w, height) && !Byte.check('hover')) {
										Byte.add('hover');
										
										let nx = Math.floor(((mouse.x - cameraes[current_camera].x) - left) / ceil), ny = Math.floor(((mouse.y - cameraes[current_camera].y) - top) / ceil);
										gr.rect(nx * ceil, ny * ceil + 24, ceil, ceil, '#f00', 1, 'stroke');
										if (Byte.check('dclick')) {
											if (!memory.select_tile) memory.select_tile = {};
											memory.select_tile.x = nx, memory.select_tile.y = ny;
											//memory.select_tile = { 'x': nx, 'y': ny };

											//console.log(memory.editor_obj + nx + 'x' + ny, nx, ny, grid_size, grid_size);
											Byte.clear('dclick');
										}
									}
									if (grect(left, top, 100, 24) && !Byte.check('hover')) {
										Byte.add('hover');
										gr.rect(0, 0, 100, 24, '#fff', .25);
										if (Byte.check('dclick')) {
											delete memory.editor_obj;
											Byte.clear('dclick');
										}
									}
									if (memory.select_tile) {
										gr.rect(memory.select_tile.x * ceil, memory.select_tile.y * ceil + 24, ceil, ceil, '#ff0', 1, 'stroke');
										let nx = memory.select_tile.x, ny = memory.select_tile.y;
										if (Byte.check('dclick') && !Byte.check('hover')) {
											let xx = Math.floor(mouse.x / zoom / grid_size), yy = Math.floor(mouse.y / zoom / grid_size), e = memory.editor_obj;
											let val = 0, keys = Object.keys(nmap.memory), sum = CONST.steps;
											for (let j = 0; j < keys.length; j++) {
												if (Math.floor(nmap.memory[keys[j]][0]) == CONST[memory.select_tile.type || 'wall']) sum += CONST.steps;
											}
											val = CONST[memory.select_tile.type || 'wall'] + sum;
											if (!nmap.memory[memory.editor_obj + nx + 'x' + ny]) nmap.registry(memory.editor_obj + nx + 'x' + ny, val, Img.init(memory.editor_obj, memory.select_tile.x * grid_size, memory.select_tile.y * grid_size, grid_size, grid_size));
											
											nmap.set(xx, yy, nmap.memory[memory.editor_obj + nx + 'x' + ny][0]);
											//console.log(memory.editor_obj + nx + 'x' + ny, memory.select_tile.x, memory.select_tile.y, nmap.memory[memory.editor_obj + nx + 'x' + ny][0]);
											console.log(xx, yy, nmap.get(xx, yy));
											memory.creplace = false;
										}
									}
								break;
							}
						}
					});
				});
			break;
			case 'rooms':
				add_gui(function(cvs) {
					gr.gui.dragWindow('rooms', offset, src.height * .075 + offset * 5, (msize + offset) * 2 + offset * 5, (msize + offset * 3) * 3 + offset, 'rooms', function(left, top) {
						Object.keys(current_level.levels).forEach(function(e, i) {
							gr.text(e, 0, 16 + 24 * i, '#fff');
							if (grect(left, top + 16 + 24 * i, 100, 16) && !Byte.check('hover')) {
								Byte.add('hover');
								gr.rect(0, 16 + 24 * i, 100, 16, '#fff', .25);
								if (Byte.check('uclick')) {
									current_level.load(e, nmap);
									Byte.clear('uclick');
								}
							}
						});
					});
				});
			break;
		}
	}
	add_gui(function(cvs) { // header:
		gr.rect(0, 0, src.width, src.height * .075, '#330115', .8);
		gr.rect(0, src.height * .075, src.width, src.height * .0025, '#000', 1);
		let yy = src.height * .01, size = src.height * .05, xx = (src.width - size) * .5, h = false, ts = size * .8;
		if (gr.gui.btn(xx, yy, size, size, pause ? '#62ab4a' : '#ec1825', function(cvs) { // running / pausing:
			gr.triangle(size * .15, size * .1, size * .8, size * .5, size * .15, size * .8, '#fff');
		})) {
			if (memory.lobjects)
				if (pause) current_level.save();
				else current_level.load(current_level.location, nmap);
				//if (pause) save(true);
				//else load();
			pause =! pause;
		}
		let placeholder_level = "level: " + current_level.location;
		cvs.textBaseline = 'middle';
		cvs.textAlign = 'right';
		cvs.font = '20px Consolas';
		gr.text(placeholder_level, xx - grid_size * 2, (src.height * .075) >> 1, '#fff', 1, 20, 'Consolas');
		cvs.textBaseline = 'top';
		cvs.textAlign = 'left';
		if (gr.gui.btn(xx + size * 1.25, yy, size * 2, size, '#62ab4a')) {
			let arr = [];
			Object.keys(nmap.memory).forEach(function(e) {
				if (nmap.memory[e]) arr[arr.length] = [e, nmap.memory[e][0], nmap.memory[e][1].path, nmap.memory[e][1].left, nmap.memory[e][1].top];
			});
			document.querySelectorAll('.export').forEach(function(e) { e.remove(); });
			let dom = document.createElement('div');
			dom.className = 'export';
			function add_export(title, content) {
				let a = document.createElement('details'), b = document.createElement('summary');
				b.innerText = title || 'No text';
				a.innerText = content;
				a.appendChild(b);
				dom.appendChild(a);
			}
			add_export('objects', JSON.stringify(memory.lobjects || []));
			add_export('map', JSON.stringify(map.grid));
			add_export('tilemap', JSON.stringify(arr));
			document.body.appendChild(dom);
			console.log('export level!');
		}
		['#62ab4a', '#fbf236', '#8ccde2', '#fff'].forEach(function(e, i) {
			if (gr.gui.btn(yy + (size + yy) * i, yy, size, size, e)) {
				switch(i) {
					case 0: memory.editor.window = 'objects'; break;
					case 1: memory.editor.window = 'tiles'; break;
					case 2: memory.editor.window = 'rooms'; break;
					case 3:
						if (memory.editor.grid == undefined) memory.editor.grid = true;
						memory.editor.grid =! memory.editor.grid;
						console.log(memory.editor.grid);
					break;
				}
				memory.editor_obj_page = 0;
				delete memory.editor_obj;
			}
		});
		
	});
	
}
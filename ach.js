memory.ach = {};
function add_ach(name, description, frame, accept) {
	let id = '#id' + Object.keys(memory.ach).length;
	memory.ach[id] = {
		'name': name || 'undefined',
		'description': description || 'no text',
		'finish': false,
		'frame': frame,
		'func': function() {
			if (accept(memory.ach[id]) && !this.finish)
				this.finish =! this.finish;
			return this.finish;
		}
	};
	return id;
}
function ach_get() {
	let arr = [], nmem = Object.keys(memory.ach);
	for (let i = 0; i < nmem.length; i++) {
		if (memory.ach[nmem[i]].finish) continue;
		arr[arr.length] = memory.ach[nmem[i]];
	}
	return arr;
}
function ach_update() {
	let arr = ach_get();
	for (let i = 0; i < arr.length; i++)
		if (arr[i].func()) return arr[i];
	return false;
}
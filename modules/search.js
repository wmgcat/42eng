modules.search = {
  title: 'search', v: '1.0',
  distance: (obj, x, y, dist, offset) => {
    let s = [];
    if (typeof(obj) == 'object')
      obj.forEach(e => { s = s.concat(modules.search.search(e)); });
    else s = modules.search.search(obj);
    s.sort((a, b) => { math.distance(x, y, a.x + (offset || 0), a.y + (offset || 0)) - math.distance(x, y, b.x + (offset || 0), b.y + (offset || 0));  });
    if (dist)
      for (let i = 0; i < s.length; i++)
        if (math.distance(x, y, s[i].x + (offset || 0), s[i].y + (offset || 0)) >= dist)
          return s.splice(0, i);
    return s;
  },
  id: function(id) {
    let s = [];
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++)
        s = s.concat(modules.search.id(arguments[i]));
    } else {
      let ind = stack.findIndex(obj => (obj.id == id));
      if (ind != -1) s.push(stack[ind]);
    }
    if (s.length > 1) return s;
    else if (s.length == 1) return s[0];
    else return false;
  },
  search: function(obj) {
    let s = [];
    for (let i = 0; i < arguments.length; i++) {
      let arg = arguments[i];
      stack.forEach(e => {
        if ((e.name == arg) || (arg == 'all')) s.push(e);
      });
    }
    return s;
  },
  count: function(obj) {
    let count = 0;
    for (let i = 0; i < arguments.length; i++) count += modules.search.search(arguments[i]).length;
    return count;
  },
  key: (name, key, value) => {
		let arr = modules.search.search(name), narr = [];
		if (arr) arr.forEach(obj => {
			if (obj[key] && obj[key] == value) narr.push(obj);
		});
		return narr;
	}
};

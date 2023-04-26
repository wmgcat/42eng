modules.search = {
  title: 'search', v: '1.1',
  distance: (type, x, y, distance, offset=0) => {
    if (!modules.math) return false;
    return modules.search.search(...type).filter(obj => (modules.math.distance(x, y, obj.x + offset, obj.y + offset) <= distance));
  },
  id: (...args) => {
    let arr = [];
    for (const id of args) {
      if (objects[id]) arr.push(objects[id]);
    }
    return arr;
  },
  search: (...args) => {
    return Object.keys(objects).filter(x => {
      for (const name of args) {
        if (name == 'all' || objects[x].name == name)
          return true;
      }
    }).map(x => objects[x]);
  },
  count: (...args) => modules.search.search(args).length,
  key: (name, key, value) => modules.search.search(name).filter(x => (x[key] == value))
};

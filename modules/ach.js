modules.arch = {
  title: 'achievements', v: '1.1', stack: {},
  add: (id, func) => { // add new achievement:
    modules.arch.stack[id] = {
      func: () => {
        if (func && !modules.arch.stack[id].finish) {
          if (func()) {
            modules.arch.stack[id].finish = true;
            return true;
          }
        }
        return false;
      },
      finish: false
    }
  },
  update: () => { // check all achievements status and get finished:
    let arr = [];
    Object.keys(modules.arch.stack).forEach(id => {
      if (modules.arch.stack[id].func()) arr.push(id);
    });
    return arr;
  }
}

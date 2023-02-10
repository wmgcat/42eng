modules.ach = {
  title: 'achievements', v: '1.1', stack: {},
  add: (id, func) => { // add new achievement:
    ach.stack[id] = {
      func: () => {
        if (func && !ach.stack[id].finish) {
          if (func()) {
            ach.stack[id].finish = true;
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
    Object.keys(ach.stack).forEach(id => {
      if (ach.stack[id].func()) arr.push(id);
    });
    return arr;
  }
}

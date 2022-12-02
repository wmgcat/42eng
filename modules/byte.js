modules.byte = {
  title: 'byte', v: '1.0',
  key: 0, macros: {
    up: 1, down: 2, left: 4, right: 8,
    active: 16, mode: 32, dclick: 64, uclick: 128,
    move: 256, hover: 512
  },
  add: function(arr) {
    for (let i = 0; i < arguments.length; i++)
      this.key |= this.macros[arguments[i]];
  },
  clear: function(arr) {
    if (arguments.length > 0)
      for (let i = 0; i < arguments.length; i++) this.key &=~ this.macros[arguments[i]];
    else this.key = 0;
  },
  check: function(arr) {
    for (let i = 0; i < arguments.length; i++)
      if ((this.key & this.macros[arguments[i]]) <= 0) return false;
    return true;
  }
};

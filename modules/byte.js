modules.byte = { title: 'byte', v: '1.1' };

ERROR.NOKEY = 3;

class Byte {
  constructor(args) {
    [this.keys, this.key] = [{}, 0];
    if (typeof(args) == 'object') {
      for (let key in args) {
        let _keys = Object.keys(this.keys);
        this.keys[args[key]] = !_keys.length + (2 << (_keys.length - 1));
      }
    } else {
      for (let key in arguments) {
        let _keys = Object.keys(this.keys);
        this.keys[arguments[key]] = !_keys.length + (2 << (_keys.length - 1));
      }
    }
  }
  add(args) {
    try {
      for (let key in arguments) {
        if (arguments[key] in this.keys) this.key |= this.keys[arguments[key]];
        else throw new Error(arguments[key]);
      }
      return true;
    }
    catch (err) {
      Add.error(err.message, ERROR.NOKEY);
      return false;      
    }
  }
  clear(args) {
    try {
      if (!arguments.length) this.key = 0;
      else {
        for (let key in arguments) {
          if (arguments[key] in this.keys) this.key &=~ this.keys[arguments[key]];
          else throw new Error(arguments[key]);
        }
      }
      return true;
    }
    catch (err) {
      Add.error(err.message, ERROR.NOKEY);
      return false;
    }
  }
  check(args) {
    try {
      for (let key in arguments) {
        if (arguments[key] in this.keys) {
          if ((this.key & this.keys[arguments[key]]) <= 0) return false;
        } else throw new Error(arguments[key]);
      }
      return true;
    }
    catch (err) {
      Add.error(err.message, ERROR.NOKEY);
      return false;
    }
  }
}

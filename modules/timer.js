modules.timer = {
  title: 'timer', v: '1.0',
  create: (x, multi=1000) => {
    let obj = {
      max: x * multi, save_max: x,
      point: 0,
      check: loop => {
        if ((obj.point - Date.now()) <= 0) {
          if (!loop) obj.reset();
          return true;
        }
        return false;
      },
      delta: () => { return math.clamp(Math.max(obj.point - Date.now(), 0) / obj.max, 0, 1); },
      count: () => { return ~~(Math.abs(obj.point - Date.now()) / obj.max); },
      reset: (x=0) => {
        if (x == 0) obj.point = Date.now() + obj.max;
        else obj.point = x;
      }
    };
    obj.reset();
    return obj;
  }
}

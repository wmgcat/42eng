modules.save = {
  title: 'save', v: '1.0',
  save: async (data) => {
    let obj = { '__savetime': Date.now() };
    for (key in data) {
      let dt = typeof(data[key]) == 'object' ? JSON.stringify(data[key]) : data[key]; 
      obj[key] = dt;
      localStorage.setItem(key, dt);
      Add.debug(`saving ${key} data: `, dt);
    }
    localStorage.setItem('__savetime', obj.__savetime);
    return obj;
  },
  load: key => {
    if (modules.save.check(key)) {
      Add.debug(`loading ${key} data: `, localStorage.getItem(key));
      return localStorage.getItem(key);
    }
    return false;
  },
  check: key => {
    if (localStorage.getItem(key)) return true;
    return false;
  },
  clear: key => { localStorage.removeItem(key); }
}

modules.save = {
  title: 'save', v: '1.0',
  save: async (data) => {
    let obj = {
      '__savetime': Date.now()
    };
    // local saving:
    for (key in data) {
      let dt = typeof(data[key]) == 'object' ? JSON.stringify(data[key]) : data[key]; 
      obj[key] = dt;
      localStorage.setItem(key, dt);
      Add.debug(`saving ${key} data: `, dt);
    }
    localStorage.setItem('__savetime', obj.__savetime);
    return obj;
  },
  load: async (key, is_cloud=false) => {
    if (localStorage.getItem(key)) {
      Add.debug(`loading ${key} data: `, localStorage.getItem(key));
      return localStorage.getItem(key);
    }
  },
  check: key => {
    if (localStorage.getItem(key)) return true;
  },
  clear: async (key, is_cloud=false) => {
    localStorage.removeItem(key);
  }
}

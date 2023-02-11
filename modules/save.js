modules.save = {
  title: 'save', v: '1.0',
  save: async (data, is_cloud=false) => {
    if (is_cloud && modules.yandex) { // cloud saving:
      
      return;
    }
    // local saving:
    for (key in data) {
      let dt = typeof(data[key]) == 'object' ? JSON.stringify(data[key]) : data[key]; 
      localStorage.setItem(key, dt);
      Add.debug(`saving ${key} data: `, dt);
    }
    return true;
  },
  load: async (key, is_cloud=false) => {
    if (is_cloud && modules.yandex) { // cloud loading:
      return;
    }
    if (localStorage.getItem(key)) {
      Add.debug(`loading ${key} data: `, localStorage.getItem(key));
      return localStorage.getItem(key);
    }
  }
}

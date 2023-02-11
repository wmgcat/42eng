modules.language = {
  title: 'language', v: '1.0',
  table: {}, select: '',
  use: function(args) {
    let text = arguments['0'];
    for (let i = 0; i < arguments.length; i++) {
      if (!i) {
        let path = arguments[i].split('.'), pos = 0, arr = modules.language.table[modules.language.select] || {};
        while(arr[path[pos]]) {
          if (typeof(arr[path[pos]]) == 'string') {
            text = arr[path[pos]];
            break;
          }
          arr = arr[path[pos++]];
        }
      } else { if (text) text = text.replace('%s', modules.language.use(arguments[i])); }
    }
    return text;
  }
}

Add.language = async function(path, short, is_first=false) {
  try {
    mloaded++;
    let script = document.createElement('script'), promise = new Promise((res, rej) => {
      script.onload = () => {
        modules.language.table[short] = Eng.copy(Lang);
        if (is_first) modules.language.select = short;
        loaded++;
        res(true);
      }
      script.onerror = () => { rej(path); }
    });
    script.src = path;
    document.body.appendChild(script);
  } catch(err) { Add.error(err, ERROR.NOFILE); }
}

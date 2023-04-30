modules.language = {
  title: 'language', v: '1.1',
  table: {}, select: '',
  use: (...args) => {
    if (!args[0]) return false;
    let path = args[0].split('.'), pos = 0,
        arr = modules.language.table[modules.language.select] || {}, text = args[0];
    while(arr[path[pos]]) {
      if (typeof(arr[path[pos]]) == 'string') {
        text = arr[path[pos]];
        break;
      }
      arr = arr[path[pos++]];
    }
    for (const param of args.splice(1, args.length - 1))
      text = text.replace('%s', `${modules.language.use(param)}`);
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

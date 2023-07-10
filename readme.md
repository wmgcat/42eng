# О проекте
Игровой движок, написанные на чистом Javascript (ES6). Использует систему модулей, не обязательно использовать абсолютно все модули, которые есть, можно ограничиться лишь тем функционалом, который вам необходим.

# Пример
index.html
```html
<!doctype html>
<html>
  <head>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
    </style>
    <script src = './42eng/eng.js' type = 'text/javascript'></script>
    <script src = './game.js' type = 'text/javascript'></script>
  </head>
  <body></body>
</html>
```

game.js
```js
cfg.debug = true;
const canvas = Add.canvas('canvas', async () => {
  Add.debug('Hello world!');
}, () => {});

canvas.init();
canvas.update();
```

### Другие примеры
| Пример | Описание |
| --- | --- |
| (examples/simple-project)[https://github.com/wmgcat/42eng/tree/dev/examples/simple-project] | Простой проект, показывает как использовать модуль graphics и math |

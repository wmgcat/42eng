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
      body { overflow: hidden; }
    </style>
  </head>
  <body>
    <script src = './42eng/eng.js' type = 'text/javascript'></script>
    <script src = './game.js' type = 'text/javascript'></script>
  </body>
</html>
```

game.js
```js
cfg.debug = true;
const canvas = Add.canvas('canvas',
  async function() {
    Add.debug('Hello world!');
  },
  function() {
    // update функция
  }
);

canvas.init();
canvas.update();
```

### Другие примеры
| Пример | Описание |
| --- | --- |
| [examples/simple-project](./simple-project) | Простой проект, показывает как использовать модуль graphics и math |
| [examples/mouse-and-keyboard](./mouse-and-keyboard) | Работа с клавиатурой и мышкой |
| [examples/image](./image) | Работа с изображениями и анимациями |
| [examples/audio](./audio) | Работа с модулем audio и звуком |
| [examples/language](./language) | Работа с модулем language и локализацией проекта |
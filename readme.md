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
      body { overflow: hidden; }
    </style>
    <script src = './42eng/eng.js' type = 'text/javascript'></script>
  </head>
  <body>
    <script src = './game.js' type = 'text/javascript'></script>
  </body>
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
| [examples/simple-project](./examples/simple-project) | Простой проект, показывает как использовать модуль graphics и math |
| [examples/mouse-and-keyboard](./examples/mouse-and-keyboard) | Работа с клавиатурой и мышкой |
| [examples/image](./examples/image) | Работа с изображениями и анимациями |
| [examples/audio](./examples/audio) | Работа с модулем audio и звуком |
| [examples/language](./examples/language) | Работа с модулем language и локализацией проекта |
| [examples/ads](./examples/ads) | Работа с различными SDK прощадок (Yandex.Games, VK, CrazyGames) |

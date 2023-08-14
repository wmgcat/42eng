/**
 * @file Модуль для отслеживания событий в метрике
 * @author wmgcat
 * @version 1.0
*/

const metrika = new Module('metrika', '1.0');

/**
 * Инициализация метрики
 * 
 * @param {number} id ID метрики
*/
metrika.init = function(id) {
  this.id = id;
  (
    function(m, e, t, r, i, k, a) {
      m[i] = m[i] || function() {
        (m[i].a = m[i].a || []).push(arguments);
      }
      m[i].l = 1 * new Date();
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r)
          return;
      }
      k = e.createElement(t);
      [k.async, k.src] = [1, r];
      a = e.getElementsByTagName(t)[0];
      a.parentNode.insertBefore(k, a);
    }
  )(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  
  ym(this.id, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  });

  let img;
  document.head.appendChild(
    document.createElement('noscript').appendChild(
      document.createElement('div')
              .appendChild(img = document.createElement('img'))
              .parentNode
    ).parentNode
  );
  [img.src, img.style, img.alt] = [
    `https://mc.yandex.ru/watch/${this.id}`,
    'position: absolute; left: -9999px;',
    ''
  ];
}

/**
 * Достижение цели
 * 
 * @param {string} goal Цель
 * @return {bool}
*/
metrika.goal = function(goal) {
  if (typeof(ym) === 'undefined') {
    Add.debug(`ym не найден!`, goal);
    return false;
  }

  ym(this.id, 'reachGoal', goal);
  Add.debug('Выполнена цель:', goal);
  return true;
}
/**
 * @file Модуль рекламы
 * @author wmgcat
 * @version 1.1
*/

const ads = new Module('ads', '1.1');

ERROR.ADS = 5; // код ошибки для рекламы
ERROR.FEEDBACK = 6; // ошибка, которая указывает что нет отзыва

ads.sdk = ''; // SDK
ads.main = false;
ads.auth = false; // авторизация на площадке
ads.ad_timer = timer.create(90); // ограничитель на показ рекламы раз в 1,5 минуты
ads.ad_timer.reset(999);
ads.feed = false; // оставлен ли отзыв

/**
 * Загружает файл SDK в игру
 * 
 * @param {string} sdk SDK площадки 
 * @param {number} id ID игры, требуется в некоторых SDK
*/
ads.set = async function(sdk, id) {
  this.sdk = sdk;
  if (sdk) {
    let path = '';
    switch(this.sdk) {
      case 'yandex': path = 'https://yandex.ru/games/sdk/v2'; break;
      case 'vk': path = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js'; break;
      case 'crazygames': path = 'https://sdk.crazygames.com/crazygames-sdk-v2.js'; break;
      case 'gamepix': path = 'https://integration.gamepix.com/sdk/v3/gamepix.sdk.js'; break;
      case 'vkplay':
        ads.id = id;
        path = `https://vkplay.ru/app/${ads.id}/static/mailru.core.js`;
      break;
    }

    try {
      await Add.script(path);
      await this.init();
      Add.debug(`${this.sdk} SDK загружен!`);
    }
    catch(err) { return Add.error(err, ERROR.ADS); }
  }
}

/**
 * Инициализация SDK площадки
*/
ads.init = async function() {
  if (!this.sdk) return;

  switch(this.sdk) {
    case 'yandex': {
      this.main = await YaGames.init();

      const safeStorage = await this.main.getStorage();
      await Object.defineProperty(window, 'localStorage', {
        get: () => safeStorage
      });
      // проверка авторизации:
      const player = await this.main.getPlayer();
      this.auth = player.getMode() !== 'lite';
      this.player = player;
    } break;
    case 'vk':
      await vkBridge.send("VKWebAppInit", {});
      ads.main = true;
      ads.auth = true;
    break;
    case 'crazygames':
      ads.main = window.CrazyGames.SDK;
    break;
    case 'gamepix': {
      ads.main = GamePix;
      localStorage = ads.main.localStorage;
    } break;
    case 'vkplay': {
      if (typeof(iframeApi) === 'undefined') {
          Add.error('Игра находится не внутри iframe!', ERROR.ADS);
          return;
      }
      ads.main = await iframeApi({
        appid: ads.id,
        adsCallback: function(data) { ads.main.adData = data; }
      });
    } break;
  }
}

/**
 * Показ полноэкранной рекламы
 * 
 * @return {Promise}
*/
ads.fullscreen = async function() {
  if (!this.main) return;
  if (!this.ad_timer.check()) return;

  if (modules.audio) Eng.focus(false);
  
  const promise = new Promise((res, rej) => {
    switch(this.sdk) {
      case 'yandex':
        this.main.adv.showFullscreenAdv({
          callbacks: {
            onClose: show => res(show),
            onOffline: () => res(true),
            onError: err => rej(err)
          }
        });
      break;
      case 'vk':
        vkBridge.send('VKWebAppCheckNativeAds', { ad_format: 'interstitial' }).then(data => {
          if (!data.result) rej('Нет рекламы!');

          vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' }).then(ad => {
            if (ad.result) res(true);
            res(false);
          });
        });
      break;
      case 'crazygames':
        this.main.ad.requestAd('midgame', {
          adError: err => rej(err),
          adFinished: () => res(true)
        });
      break;
      case 'gamepix':
        this.main.interstitialAd().then(e => {
          if (e.success) res(true);
          else rej('Ошибка фуллскрин рекламы!');
        });
      break;
      case 'vkplay': {
        this.main.showAds({ interstitial: true });
        res(new Promise(async (su, er) => {
          const _set = setInterval(() => {
            if (!ads.main.adData) return;
            clearInterval(_set);
            const data = ads.main.adData;
            delete ads.main.adData;
            su(true);
          }, 1);
        }));
      } break;
    }
  });
  modules.ads.ad_timer.reset();
  try {
    pause = true;
    const state = await promise;
    if (modules.audio) Eng.focus(true);
    pause = false;
    return state;
  }
  catch(err) {
    pause = false;
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Показ рекламы за награду
 * 
 * @return {Promise}
*/
ads.reward = async function() {
  if (!this.main) return;

  if (modules.audio) Eng.focus(false);
  
  const promise = new Promise((res, rej) => {
    switch(this.sdk) {
      case 'yandex': {
        let view = false;
        this.main.adv.showRewardedVideo({
          callbacks: {
            onRewarded: () => { view = true },
            onClose: () => res(view),
            onError: err => rej(err)
          }
        });
      } break;
      case 'vk':
        vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' }).then(data => {
          if (data.result) res(true);
          else res(false);
        }).catch(err => rej(err));
      break;
      case 'crazygames':
        this.main.ad.requestAd('rewarded', {
          adError: err => rej(err),
          adFinished: () => res(true)
        });
      break;
      case 'gamepix':
        this.main.rewardAd().then(e => {
          if (e.success) res(true);
          else res(false);
        });
      break;
      case 'vkplay': {
        this.main.showAds();
        res(new Promise(async (su, er) => {
          const _set = setInterval(() => {
            if (!ads.main.adData) return;
            clearInterval(_set);
            const data = ads.main.adData;
            delete ads.main.adData;
            if (data.type != 'adDismissed' && data.type != 'adError')
              su(true);
            else su(false);
          }, 1);
        }));
      } break;
    }
  });
  try {
    pause = true;
    const state = await promise;
    if (modules.audio) Eng.focus(true);
    pause = false;
    return state;
  }
  catch(err) {
    pause = false;
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Взаимодействие с таблицей рекордов
*/
ads.leaderboard = {
  board: '' // ID таблицы
}

/**
 * Установка таблицы рекордов по умолчанию
 * 
 * @param  {string} id ID таблицы
*/
ads.leaderboard.set = async function(id) {
  this.board = id;
  switch(ads.sdk) {
    case 'yandex':
      ads.main.board = await ads.main.getLeaderboards();
    break;
    case 'gamepix':
      ads.main.board = true;
    break;
  }
}

/**
 * Записывает очки в таблицу
 * 
 * @param  {number} score Очки
*/
ads.leaderboard.score = async function(score) {
  if (!ads.main || !ads.main.board) return;

  switch(ads.sdk) {
    case 'yandex':
      await ads.main.board.setLeaderboardScore(this.board, score);
    break;
    case 'gamepix':
      ads.main.updateScore(score);
    break;
  }
}

ads.leaderboard.get = async function() {
  if (!ads.main || !ads.main.board) return;

  switch(ads.sdk) {
    case 'yandex':
      try {
        const result = await ads.main.board.getLeaderboardPlayerEntry(this.board);
        return result.score;
      }
      catch(err) {
        if (err.code != 'LEADERBOARD_PLAYER_NOT_PRESENT') return 0;
        return 0;
      }
    break;
  }
}

/**
 * Оставить отзыв
*/
ads.feedback = async function() {
  if (!this.main || ads.feed) return;

  if (modules.audio) Eng.focus(false);

  const promise = new Promise((res, rej) => {
    switch(this.sdk) {
      case 'yandex':
        this.isFeedback().then(status => {
          if (!status || !status.value) rej(ERROR.FEEDBACK);

          this.main.feedback.requestReview()
          .then(data => res(data.feedbackSent))
          .finally(() => { ads.feed = true; });
        });
      break;
    }
  });

  try {
    const state = await promise;
    if (modules.audio) Eng.focus(true);
    ads.feed = true;
    return state;
  }
  catch(err) {
    ads.feed = true;
    if (err != ERROR.FEEDBACK)
      return Add.error(err, ERROR.ADS);
    return err;
  }
}

/**
 * Проверка на доступность оставления отзыва
 * 
 * @return {bool}
*/
ads.isFeedback = async function() {
  if (!this.main) return;
  const promise = new Promise((res, rej) => {
    switch(this.sdk) {
      case 'yandex':
        this.main.feedback.canReview().then(status => {
          if (!status || !status.value) rej(ERROR.FEEDBACK);
          res(true);
        }).catch(e => {
          res(false);
        })
      break;
    }
  });

  try {
    const state = await promise;
    ads.feed = !state;
    return state;
  }
  catch(err) {
    ads.feed = true;
    if (err != ERROR.FEEDBACK)
      return Add.error(err, ERROR.ADS);
    return err;
  }
}

/**
 * Покупки
*/
ads.pay = {};

/**
 * Инициализация покупок
*/
ads.pay.init = async function() {
  if (!ads.main) return;

  const promise = new Promise((res, rej) => {
    switch(ads.sdk) {
      case 'yandex':
        ads.main.getPayments({ signed: false }).then(_pay => {
          ads.pay.main = _pay;
          res(true);
        }).catch(e => rej(e));
      break;
    }
  });

  try {
    const state = await promise;
    return state;
  }
  catch(err) {
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Покупка предмета по ID
 * 
 * @param  {string} id ID предмета
 * @return {bool}
*/
ads.pay.set = async function(id) {
  if (!ads.main || !ads.pay.main) return;
  if (modules.audio) Eng.focus(false);

  const promise = new Promise((res, rej) => {
    switch(ads.sdk) {
      case 'yandex':
        ads.pay.main.purchase({id: id}).then((item) => {
          res(item.purchaseToken);
        }).catch(e => {
          Add.debug(e);
          res(false);
        });
      break;
      default:
        res(false);
      break;
    }
  });

  try {
    const state = await promise;
    if (modules.audio) Eng.focus(true);
    return state;
  }
  catch(err) {
    if (modules.audio) Eng.focus(true);
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Получение списка покупок
 *
 * @return {array}
*/
ads.pay.get = async function() {
  if (!ads.main || !ads.pay.main) return;

  const promise = new Promise((res, rej) => {
    switch(ads.sdk) {
      case 'yandex':
        ads.pay.main.getPurchases()
          .then(list => res(list))
          .catch(e => {
            Add.error(e, ERROR.ADS);
            res([]);
          });
      break;
      default:
        rej([]);
      break;
    }
  });

  try {
    const state = await promise;
    return state;
  }
  catch(err) {
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Получение всех товаров, которые можно купить
 * 
 * @return {array}
*/
ads.pay.getAll = async function() {
  if (!ads.main || !ads.pay.main) return;

  const promise = new Promise((res, rej) => {
    switch(ads.sdk) {
      case 'yandex':
        ads.pay.main.getCatalog().then(list => res(list)).catch(e => res([]));
      break;
      default:
        rej([]);
      break;
    }
  });

  try {
    const state = await promise;
    return state;
  }
  catch(err) {
    return Add.error(err, ERROR.ADS);
  }
}

ads.pay.success = async function(token) {
  if (!ads.main || !ads.pay.main) return;

  const promise = new Promise((res, rej) => {
    switch(ads.sdk) {
      case 'yandex':
        ads.pay.main.consumePurchase(token).then(e => {
          res(true);
        });
      break;
      default:
        rej(false);
      break;
    }
  });

  try {
    const state = await promise;
    return state;
  }
  catch(err) {
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Облачные сохранения
*/
ads.cloud = {};

/**
 * Вытаскивает данные из облака по ключу
 * 
 * @param  {...string} args Ключи сохранения
 * @return {object|bool}
*/
ads.cloud.get = async function(...args) {
  if (!ads.main) return;

  try {
    switch(ads.sdk) {
      case 'yandex': {
        const player = await ads.main.getPlayer(),
              data = await player.getData(args);
        return data;
      } break;
      case 'vk': {
        const result = await vkBridge.send('VKWebAppStorageGet', { keys: args.map(x => x.replaceAll('.', '_')) }),
              data = {};
        for (const elem of result.keys)
          data[elem.key.replaceAll('_', '.')] = elem.value;

        return data;
      } break;
    }
  }
  catch(err) {
    return Add.error(err, ERROR.ADS);
  }
}

/**
 * Записывает данные в облако
 * 
 * @param  {object} data Объект ключ-значение
 * @return {bool}
*/
ads.cloud.set = async function(data) {
  if (!ads.main) return;

  try {
    switch(ads.sdk) {
      case 'yandex': {
        const player = await ads.main.getPlayer(),
              state = await player.setData(data);
        return true;
      } break;
      case 'vk': {
        for (let id of Object.keys(data)) {
          await vkBridge.send('VKWebAppStorageSet', {
            key: id.replaceAll('.', '_'),
            value: data[id] + ''
          });
        }
        return true;
      } break;
    }
  }
  catch(err) {
    Add.error(err, ERROR.ADS);
    return false;
  }
}

/**
 * Открытие ссылки
 * 
 * @param  {string} url Адрес
*/
ads.open = function(url) {
  if (typeof(window.open) == 'function') {
    window.open(url, '_blank');
    return;
  }
  window.location.href = url;
}
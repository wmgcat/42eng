modules.adv = {
  title: 'adv', v: '1.0',
  init: type => {
    modules.adv.type = type;
    switch(type) {
      case 'yandex':
        modules.yandex.init();
        modules.adv.profile = modules.yandex.profile;
        modules.adv.fullscreen = modules.yandex.adv.fullscreen;
        modules.adv.reward = modules.yandex.adv.reward;
        modules.adv.banner = modules.yandex.adv.banner;
        modules.adv.leaderboard = {
          get: modules.yandex.leaderboard.get,
          add: modules.yandex.leaderboard.add
        };
      break;
      case 'vk':
        modules.vk.init();
        modules.adv.profile = async () => {};
        modules.adv.fullscreen = modules.vk.adv.fullscreen;
        modules.adv.reward = modules.vk.adv.reward;
        modules.adv.banner = modules.vk.adv.banner;
        modules.adv.leaderboard = {
          get: async () => {},
          add: async () => {}
        };
        modules.adv.banner().then(e => { Add.debug('banner is', e); });
      break;
    }
    Add.debug(`adv mode is ${modules.adv.type}`);
  }
};

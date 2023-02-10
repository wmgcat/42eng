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
      break;
    }
    Add.debug(`adv mode is ${modules.adv.type}`);
  }
};

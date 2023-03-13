modules.vk = {
  title: 'vk', v: '1.0',
  init: () => {
    vkBridge.send("VKWebAppInit", {});
  },
  adv: {
    check: async (format='interstitial') => {
      try {
        let data = await vkBridge.send('VKWebAppCheckNativeAds', { ad_format: format });
        if (data.result) return true;
      }
      catch(err) {  
        Add.error(err, 0);
        return false;
      }
    },
    reward: async () => {
      let check = await modules.vk.adv.check('reward');
      if (check) {
        if (modules.audio) Eng.focus(false);
        let promise = new Promise((res, rej) => {
          vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'reward' }).then(data => {
            if (data.result) res(1);
            else res(0);
          }).catch(err => {
            Add.error(err, 0);
            res(0);
          });
        });
        let state = await promise;
        if (modules.audio) Eng.focus(true);
        return state;
      }
      return false;
    },
    fullscreen: async () => {
      let check = await modules.vk.adv.check();
      if (check) {
        if (modules.audio) Eng.focus(false);
        let promise = new Promise((res, rej) => {
          vkBridge.send('VKWebAppShowNativeAds', { ad_format: 'interstitial' }).then(data => {
            if (data.result) res(1);
            else res(0);
          }).catch(err => {
            Add.error(err, 0);
            res(0);
          });
        });
        let state = await promise;
        if (modules.audio) Eng.focus(true);
        return state;
      }
      return false;
    },
    banner: async (location='bottom') => {
      let status = await vkBridge.send('VKWebAppShowBannerAd', { banner_location: location });
      if (status.result) return true;
      return false;
    }
  },
  share: async link => {
    let status = await vkBridge.send('VKWebAppShare', { link: link });
    if (status.result) return true;
    return false;
  },
  invite: async (key="anonim") => {
    if (modules.audio) Eng.focus(false);
    let state = await vkBridge.send('VKWebAppShowInviteBox', { requestKey: key });
    if (modules.audio) Eng.focus(true);
    if (state.success) {
      return true;
    }
    return false;
  },
  leaderboard: async (score=0) => {
    try {
      if (modules.audio) Eng.focus(false);
      let data = await vkBridge.send('VKWebAppShowLeaderBoardBox', { user_result: score });
      if (modules.audio) Eng.focus(true);
      if (data.success) return true;
    }
    catch(err) {
      Add.error(err, 0);
      if (modules.audio) Eng.focus(true);
      return false;
    }
  },
  cloud: {
    set: async obj => {
      try {
        for (let key in obj) {
          let state = await vkBridge.send('VKWebAppStorageSet', {
            key: key,
            value: obj[key]
          });
        }
        return true;
      }
      catch(err) {
        Add.error(err, 0);
        return false;
      }
    },
    get: async arr => {
      try {
        let data = await vkBridge.send('VKWebAppStorageGet', { keys: arr });
        return data.keys;
      }
      catch(err) {
        Add.error(err, 0);
        return false;
      }
    }
  },
  params: async () => {
    let data = await vkBridge.send('VKWebAppGetLaunchParams');
    if (data.vk_app_id) return data;
    return false;
  }
};

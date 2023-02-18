modules.yandex = {
  title: 'yandex', v: '1.0',
  init: async function() {
    let ya = await YaGames.init();
    modules.yandex.main = ya;
    Add.debug(`${modules.yandex.title} module init!`);
    modules.yandex.main.getStorage().then(safeStorage => Object.defineProperty(window, 'localStorage', { get: () => safeStorage }))
    .then(() => {
      localStorage.setItem('_safeStorage', 'safeStorage is working');
      Add.debug(localStorage.getItem('_safeStorage'));
    });
    return true;
  },
  profile: {
    player: async function() {
      let _player = await modules.yandex.main.getPlayer();
      return Promise.resolve(_player);
    },
    info: async function(photo='small') {
      let data = {};
      await modules.yandex.profile.player().then(dt => {
        data = {
          username: dt.getName(), photo: dt.getPhoto(photo),
          id: dt.getUniqueID(), auth: dt.getMode() !== 'lite'
        };
      });
      return Promise.resolve(data);
    },
    getData: async function(args) {
      let data = {}, pl = await modules.yandex.profile.player();
      if (pl) {
        if (args) args = [args];
        data = await pl.getData(args);
      }
      return Promise.resolve(data);
    },
    setData: async function(data) {
      let state = 0, pl = await modules.yandex.profile.player();
      await pl.setData(data).then(() => {
        state = 1;
      }).catch(() => { state = 2; });
      return Promise.resolve(state);
    },
    auth: async function() {
      let is_auth = await modules.yandex.profile.getAuth();
      if (!is_auth) {
        try {
          await modules.yandex.main.auth.openAuthDialog();
          is_auth = 1;
        }
        catch(err) { is_auth = 2; }
      }
      return is_auth;
      /*let pl = await modules.yandex.profile.player(), is_auth = pl.getMode() !== 'lite';
      if (!is_auth) {
        await modules.yandex.main.auth.openAuthDialog().then(() => {
          is_auth = 1;
        }).catch(() => { is_auth = 2 });
      }
      return Promise.resolve(is_auth);*/
    },
    getAuth: async function() {
      let pl = await modules.yandex.profile.player();
      return pl.getMode() !== 'lite';
    }
  },
  adv: {
    fullscreen: async function() {
      let state = 0;
      if (!modules.yandex.adv.is_show) {
        if (!modules.yandex.adv.timer) {
          modules.yandex.adv.timer = timer.create(60);
          modules.yandex.adv.timer.reset(60);
        }
        if (modules.yandex.adv.timer.check(true)) {
          modules.yandex.adv.is_show = true;
          if (modules.audio) Eng.focus(false);
          Add.debug('focus out!');
          let promise = new Promise((res, rej) => {
            let mode = 0;
            modules.yandex.main.adv.showFullscreenAdv({
              callbacks: {
                onClose: function(show) {
                  if (show) mode = 1;
                  if (modules.audio) Eng.focus(true);
                  Add.debug('focus in!');
                  modules.yandex.adv.timer.reset();
                  res(mode);
                },
                onOffline: function() { mode = 2; },
                onError: function() { mode = 3; }
              }
            });
          });
          state = await promise;
        }
      }
      return Promise.resolve(state);
    },
    reward: async function() {
      let state = 0;
      try {
        if (modules.audio) Eng.focus(false);
        Add.debug('focus out!');
        let promise = new Promise((res, req) => {
          let mode = 0;
          modules.yandex.main.adv.showRewardedVideo({
            callbacks: {
              onRewarded: () => { mode = 1; },
              onClose: () => {
                if (!mode) mode = 2;
                if (modules.audio) Eng.focus(true);
                Add.debug('focus in!');
                res(mode);
              },
              onError: () => { req(3); }
            }
          });
        });
        state = await promise;
      } catch(err) {
        Add.error(err);
        state = -1;
      }
      return Promise.resolve(state);
    },
    banner: {
      status: async function() {
        let promise = new Promise((res, req) => {
          let mode = 0;
          modules.yandex.main.adv.getBannerAdvStatus().then(({stickyAdvIsShowing, reason}) => {
            if (stickyAdvIsShowing) mode = 1;
            else if (reason) mode = 2;
            res(mode);
          });
        }), state = await promise;
        return Promise.resolve(state);
      },
      show: async function() {
        let state = 0;
        await modules.yandex.adv.banner.status().then(mode => {
          if (!mode) {
            modules.yandex.main.adv.showBannerAdv();
            state = 1;
          } else state = 2;
        }).catch(() => { state = 2; })
        return Promise.resolve(state);
      },
      hide: async function() {
        let state = 0;
        await modules.yandex.adv.banner.status().then(mode => {
          if (mode) {
            modules.yandex.main.adv.hideBannerAdv();
            state = 1;
          } else state = 2;
        }).catch(() => { state = 2; });
        return Promise.resolve(state);
      }
    }
  },
  metrika: { // yandex.metrika:
    id: 0,
    init: id => {
      modules.yandex.metrika.id = id;
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      var z = null;m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      ym(modules.yandex.metrika.id, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true
      });
    },
    goal: name => {
      ym(modules.yandex.metrika.id, 'reachGoal', name);
      Add.debug('reach is goal!', name);
    }
  }
};
/*YA = {
	'version': '1.0',
	'enabled': false,
	'ads': true,
	'login': false,
	'gameinit': false,
	'is_auth': false,
	'is_pay': false,
	'is_feedback': false,
	'environment': {},
	'device': ''
};
try {
	YaGames.init().then(function(ya) {
		Add.debug('ya.js module success!');
		if (ya.environment) {
			YA.enabled = true;
			YA.environment = ya.environment;
			YA.device = ya.deviceInfo.type;
			Add.debug('Устройство:', YA.device);
			ya.getStorage().then(storage => { // change localstorage for apple:
				Object.defineProperty(window, 'localStorage', { get: () => storage });
				YA.gameinit = true;
			});
			// оценка игры:
			YA.feedback = (success, error, get) => {
				Eng.focus(false);
				ya.feedback.canReview().then(({value, reason}) => {
					if (value) {
						if (!get) {
							ya.feedback.requestReview().then(({res}) => {
								if (success) success(res);
								Eng.focus(true);
							});
							YA.is_feedback = true;
						} else YA.is_feedback = false;	//(reason);
					} else { 
						YA.is_feedback = true;
						if (error) error(reason); 
					}
					Eng.focus(true);
				});
			}
			// таблицы рекордов:
			YA.getLeaderBoard = (id, success, error) => { // получение таблицы:
				ya.getLeaderboards().then(dbs => dbs.getLeaderboardDescription(id)).then(res => {
					if (success) success(res);
				}).catch(err => {
					if (error) error(err);
				});
			}
			YA.getLeaderScore = (id, success, error) => { // получение записанных очков:
				ya.getLeaderboards().then(dbs => dbs.getLeaderboardPlayerEntry(id)).then(res => {
					if (success) success(res);
				}).catch(err => {
					if (err.code === 'LEADERBOARD_PLAYER_NOT_PRESENT' && error) error(err);
				});
			}
			YA.getLeaderEntries = (id, success, current_user=false, around=5, top=5) => { // получение таблицы лидеров:
				ya.getLeaderboards().then(dbs => {
					dbs.getLeaderboardEntries(id, {quantityTop: top, includeUser: current_user, quantityAround: around}).then(res => { 
						if (success) success(res); 
					});
				});
			}
			YA.setLeaderScore = (id, score, success, error) => { // запись нового значение:
				ya.isAvailableMethod('leaderboards.setLeaderboardScore').then(() => {
					ya.getLeaderboards().then(dbs => {
						dbs.setLeaderboardScore(id, score);
						if (success) success();
					}).catch(err => {
						if (error) error(err);
					});
				}).catch(err => { if (error) error(err); });
			}	
			// покупки:
			ya.getPayments({ 'signed': true}).then(function(pay) {
				YA.is_pay = true;
				//console.log('PAY', pay);
		 		YA.getcatalog = (success, error) => {
		 			pay.getCatalog().then(dt => {
			 			if (success) success(dt);
		 			}).catch(err => { if (error) error(err); })
		 		}
		 		YA.buy = function(id, success, error) {
		 			Eng.focus(false);
		 			pay.purchase({ 'id': id }).then(function(ev) {
		 				Eng.focus(true);
		 				if (success) {

		 					success(ev);
		 					
		 				}
		 				//console.log(ev);
		 			}).catch(function(err) {
		 				Eng.focus(true);
		 				if (error) error(err);
		 				//console.error(err);
		 			});
		 		}
		 		YA.getpay = function(success, error) {
		 			pay.getPurchases().then(function(list) {
		 				if (success) success(list);
		 				//console.log(list);
		 			}).catch(function(err) {
		 				//console.log(err);
		 				if (error) error(err);
		 			});
		 		}
		 		YA.initpay = function(funcitem) {
		 			pay.getPurchases().then(function(items) {
		 				items.forEach(funcitem);
		 				//console.log(items);
		 			}).catch(err => {});
		 		}
			}).catch(err => {
				Add.debug(err);
				YA.is_pay = 2;
			});
		}
	});
} catch(err) { Add.debug(err); }*/

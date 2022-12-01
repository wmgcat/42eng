YA = {
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
			YA.fullscreen = function(success, error, offline) {
				Eng.focus(false);
				ya.adv.showFullscreenAdv({
					'callbacks': {
						'onError': function(err) {
							if (error) error(err);
							Add.debug(err);
							Eng.focus(true);
						},
						'onClose': function(show) {
							if (success) success(show)
							Eng.focus(true);
							Add.debug('ya.adv.showFullScreenAdv is success', 'code:', show);
						},
						'onOffline': function() {
							if (offline) offline();
							Eng.focus(true);
							Add.debug('offline mode');
						}
					}
				});
			}
			YA.reward = function(success, error, close) {
				Eng.focus(false);
				ya.adv.showRewardedVideo({
					'callbacks': {
						'onRewarded': function() {
							if (success) success();
							Eng.focus(true);
						},
						'onClose': function() {
							if (close) close();
							Eng.focus(true);
						},
						'onError': function(err) {
							if (error) error(err);
							Eng.focus(true);
						}
					}
				});
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
		// информация о пользователе:
		YA.profile = function(success) {
			ya.getPlayer().then(function(player) {
				if (success) {
					YA.is_auth = true;
					YA.feedback(undefined, undefined, true);
					success(player);
				}
				YA.getcloud = (success, error) => {
					player.getData().then(dt => {
						if (success) success(dt);
					}).catch(err => { if (error) error(err); });
				}
				YA.setcloud = (data, success, error) => {
					player.setData(data).then(dt => {
						if (success) success(dt);
					}).catch(err => { if (error) error(err); });
				}
			}).catch(err => {
				//console.log('err api!', err);
				YA.is_feedback = true;
			});
		}
		// авторизация в яндексе:
		YA.auth = (success, error=()=>{}) => {
			ya.auth.openAuthDialog().then(() => {
				YA.is_auth = true;
				YA.profile(success);
			}).catch(error);
		}
	});
} catch(err) { Add.debug(err); }
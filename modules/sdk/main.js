import * as YandexGames from './src/yandex.js';
import * as _GamePix from './src/gamepix.js';

const EVENTS = {
	Ready: () => {},
	ADStart: (type) => {},
	ADStop: (type, id, success) => {}
}

function setEvent(event, func) {
	EVENTS[event] = func;
}

export {
	EVENTS, setEvent,
	YandexGames, _GamePix
}
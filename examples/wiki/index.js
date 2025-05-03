import { Game, Modules } from '42eng';
Modules.mMath.init();





import Player from './player.js';
import Coin from './coin.js';

const Main = new Game('game', {});

const Images = {};
async function addImage(id, image, left, top, w, h, xoff, yoff, frames, speed) {
	Images[id] = new Modules.Image(Main, image, left, top, w, h, xoff, yoff, frames, speed, 0);
	return (await Images[id].load());
}

async function init() {
	const { audio, addPath } = Modules.Audio;

	audio.volume('sounds', 1);
	await Promise.all([
		addImage('coin', require('./img/coin.png'), 0, 0, 16, 16, 8, 8, 3, .25),
		addPath(Main, require('./audio/coin.mp3'), 'sounds', 'coin')
	])
	Main.loaded = true; // Сообщаем игре, что мы загрузили все данные
}
init();



const Control = new Modules.Controller(Main, {
	'w': 'up',
	's': 'down',
	'a': 'left',
	'd': 'right'
});

const Camera = {
	x: 0,
	y: 0
}

const player = new Player(0, 0);
const coins = [];
for (let i = 0; i < 10; i++)
	coins.push(new Coin(-300 + Math.random() * 600, -300 + Math.random() * 600, 10 + Math.random() * 32));
console.log(coins);
Main.update((deltatime, canvas, ratio) => {
	const x = Camera.x,
		  y = Camera.y;

	Camera.x = player.x - canvas.w * .5;
	Camera.y = player.y - canvas.h * .5;

	canvas.rect(0, 0, canvas.w, canvas.h, '#acc656');
	canvas.circle(-x, -y, ratio * .25, '#000000', 0, Math.PI * 2, .1);
	player.update(Control, deltatime);
	player.draw(canvas, ratio, Camera.x, Camera.y);
	coins.filter(x => !x.is_destroy).map(coin => {
		coin.update(player);
		coin.draw(canvas, ratio, Camera.x, Camera.y);
	})
});

export { Images, Modules }
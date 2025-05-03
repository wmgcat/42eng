import { Images, Modules } from './index.js';

export default class Coin {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;

        this.size = size;
        this.is_destroy = false;
    }

    update(player) {
        if (this.is_destroy) return;
        const is_collision = Math.distance(this.x, this.y, player.x, player.y) <= (this.size + player.size);
        if (is_collision) {
            this.is_destroy = true;
            player.size += this.size * .25;
            Modules.Audio.audio.play('coin', false);
        }
    }

    draw(cvs, ratio, camera_x, camera_y) {
        Images.coin.draw(-camera_x + this.x, -camera_y + this.y, this.size, this.size);
        //cvs.circle(-camera_x + this.x, -camera_y + this.y, this.size, '#FFF68F');
    }
}
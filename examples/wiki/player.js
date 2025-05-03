export default class Player {
    constructor(x, y, size=32) {
        this.x = x;
        this.y = y;
        this.size = size;
    }
    update = (Controller, dt) => {
        const hspd = Math.sign(Controller.key.check('right') - Controller.key.check('left')),
		      vspd = Math.sign(Controller.key.check('down') - Controller.key.check('up'));
        
        this.x += hspd * dt * 100;
        this.y += vspd * dt * 100;
    }
    draw = (cvs, ratio, camera_x=0, camera_y=0) => {
        cvs.circle(-camera_x + this.x, -camera_y + this.y, this.size, '#000000');
    }
}
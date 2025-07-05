import { Position, Position2D } from './components/position.js';

export default class Entity {
    constructor(x, y, z) {
        this.id = crypto.randomUUID();
        this.position = new Position(x, y, z);
    }
}

export class Entity2D {
    constructor(x, y) {
        this.id = crypto.randomUUID();
        this.position = new Position2D(x, y);
        this.layer = 0;
    }
}
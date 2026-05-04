import {
    Position,
    Position2D
} from "./components";

export default class Entity {
    id: string;
    x: number;
    y: number;
    z: number;
    position: Position;

    constructor(
        x: number,
        y: number,
        z: number
    ) {
        this.id = crypto.randomUUID();
        this.position = new Position(x, y, z);
    }
}

export class Entity2D {
    id: string;
    x: number;
    y: number;
    position: Position2D;
    layer: number;
    draw: (...params: Record<string, any>[]) => void;

    constructor(
        x: number,
        y: number
    ) {
        this.id = crypto.randomUUID();
        this.position = new Position2D(x, y);
        this.layer = 0;
    }
}
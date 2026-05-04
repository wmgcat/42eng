/**
 * Postion 3D
 * 
 * @param x - X
 * @param y - Y
 * @param z - Z
*/
export class Position {
    x: number;
    y: number;
    z: number;
    
    constructor(
        x: number,
        y: number,
        z: number
    ) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

/**
 * Position 2D
 * 
 * @param x - X
 * @param y - Y
*/
export class Position2D extends Position {
    constructor(
        x: number,
        y: number
    ) {
        super(x, y, 0);
    }
}
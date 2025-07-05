/**
 * Компонент позиции в 3D
 * 
 * @param x {Integer} X
 * @param y {Integer} Y
 * @param z {Integer} Z
*/
export class Position {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

/**
 * Компонент позиции в 2D (Наследуется с 3D позиции)
 * 
 * @param x {Integer} X
 * @param y {Integer} Y
*/
export class Position2D extends Position {
    constructor(x, y) {
        super(x, y, 0);
    }
}
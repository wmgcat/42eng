/**
 * Система для отрисовки изображения на основе компонента позиции
 * 
 * @param {Image} Image Изображение
 * @param {Position2D} PosComponent Компонент позиции XY 
 * @param  {...any} other Аргументы для передачи данных в изображение 
*/
export function DrawImageSystem(Image, PosComponent, ...other) {
    Image.draw(PosComponent.x, PosComponent.y, ...other);
}

export function DrawEntities2D(ListEntity2D, callback, ...params) {
    ListEntity2D.sort((a, b) => a.layer - b.layer).forEach((Entity, index) => {
        if (!Entity) return;
        if (callback)
            callback(Entity, index);
        if (Entity.draw)
            Entity.draw(...params);
    });
    /*for (const Entity of ListEntity2D.sort((a, b) => a.layer - b.layer)) {
        if (!Entity) continue;
        
        if (callback)
            callback(Entity);
        if (Entity.draw)
            Entity.draw(...params);
    }*/
        
}
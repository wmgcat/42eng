import { Position2D } from "../components";
import { Entity2D } from "../entity";

/**
 * Draw Image 2D
 * 
 * @param Image - Image instance 
 * @param PosComponent - Position2D component
 * @param params - Other parameters
*/
export const DrawImageSystem = (
    Image: any,
    PosComponent: Position2D,
    ...params: Record<string, any>[]
) =>
    Image.draw(PosComponent.x, PosComponent.y, ...params);

/**
 * Render list of Entity2D
 * 
 * @param ListEntity2D - Entity2D list 
 * @param callback - Callback function
 * @param params - Other parameters
*/
export const DrawEntities2D = (
    ListEntity2D: Entity2D[],
    callback: (entity: Entity2D, index: number) => void,
    ...params: Record<string, any>[]
) =>
    ListEntity2D.sort((a: Entity2D, b: Entity2D) => a?.layer - b?.layer)
        .forEach((Entity: Entity2D, index: number) => {
            if (!Entity)
                return;
            callback && callback?.(Entity, index);
            Entity?.draw && Entity?.draw?.(...params);
        });
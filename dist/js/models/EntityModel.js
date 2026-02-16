/**
 * Base class for all entities (Actors, Pickups).
 */
export class EntityModel {
    /**
     * @param x Initial X coordinate.
     * @param y Initial Y coordinate.
     */
    constructor(x, y) {
        this.type = 'entity';
        this.x = x;
        this.y = y;
        this.gridSize = 8;
    }
    /**
     * Called when another entity touches this entity.
     * @param other The other entity that touched this entity.
     */
    onTouch(other) { }
}
//# sourceMappingURL=EntityModel.js.map
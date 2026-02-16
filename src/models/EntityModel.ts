export interface ISceneWithItemDrops extends Phaser.Scene {
  spawnPickup(item: EntityModel): void;
}

/**
 * Base class for all entities (Actors, Pickups).
 */
export class EntityModel {
  public x: number;
  public y: number;
  public gridSize: number;
  public type: string = 'entity';

  /**
   * @param x Initial X coordinate.
   * @param y Initial Y coordinate.
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.gridSize = 8;
  }

  /**
   * Called when another entity touches this entity.
   * @param other The other entity that touched this entity.
   */
  onTouch(other: EntityModel): void {}
}

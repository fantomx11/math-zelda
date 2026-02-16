export interface ISceneWithItemDrops extends Phaser.Scene {
  spawnPickup(item: EntityModel): void;
}

export interface EntityConfig {
  gridSize?: number; // Made optional for defaults to work
}

/**
 * Base class for all entities (Actors, Pickups).
 */
export abstract class EntityModel {
  //#region Properties
  private _x: number;
  private _y: number;
  private _gridSize: number;
  private _type: string;
  private _subtype: string;
  private _scene: ISceneWithItemDrops;
  //#endregion

  //#region Constructor
  /**
   * @param x Initial X coordinate.
   * @param y Initial Y coordinate.
   * @param scene The Phaser scene instance.
   * @param config Optional configuration for type and grid settings.
   */
  constructor(x: number, y: number, type: string, subtype: string, scene: ISceneWithItemDrops, config?: EntityConfig) {
    const { gridSize = 8 } = config || {};

    this._x = x;
    this._y = y;
    this._scene = scene;
    this._gridSize = gridSize;
    this._type = type;
    this._subtype = subtype;
  }
  //#endregion

  //#region Accessors
  public get x(): number {
    return this._x;
  }

  protected set x(value: number) {
    this._x = value;
  }

  public get y(): number {
    return this._y;
  }

  protected set y(value: number) {
    this._y = value;
  }

  public get gridSize(): number {
    return this._gridSize;
  }

  protected set gridSize(value: number) {
    this._gridSize = value;
  }

  public get type(): string {
    return this._type;
  }

  protected set type(value: string) {
    this._type = value;
  }

  public get scene(): ISceneWithItemDrops {
    return this._scene;
  }

  protected set scene(value: ISceneWithItemDrops) {
    this._scene = value;
  }

  public get subtype(): string {
    return this._subtype;
  }
  protected set subtype(value: string) {
    this._subtype = value;
  }
  //#endregion

  //#region Methods
  /**
   * Called when another entity touches this entity.
   * @param other The other entity that touched this entity.
   */
  abstract onTouch(other: EntityModel): void;


  abstract tick(): boolean;
  //#endregion
}
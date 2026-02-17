import { EntitySubtype, EntityType, ValidSubtype } from "../EntityType";

export interface ISceneWithItemDrops extends Phaser.Scene {
  spawnPickup(item: EntityModel): void;
}

export interface EntityConfig {
  x: number;
  y: number;
  type: EntityType;
  subtype: EntitySubtype;
  gridSize?: number; // Made optional for defaults to work
}

export type DefaultConfig<T> = {
  [K in keyof T]: undefined extends T[K] ? Required<T>[K] : never;
};

const defaultConfig: DefaultConfig<EntityConfig> = {
  gridSize: 8,
};

/**
 * Base class for all entities (Actors, Pickups).
 */
export abstract class EntityModel {
  //#region Properties
  private _x: number;
  private _y: number;
  private _gridSize: number;
  private _type: EntityType;
  private _subtype: EntitySubtype;
  private _scene: ISceneWithItemDrops;

  abstract readonly alpha: number;
  //#endregion

  //#region Constructor
  /**
   * @param scene The Phaser scene instance.
   * @param config Configuration for entity initialization.
   */
  constructor(scene: ISceneWithItemDrops, config: EntityConfig) {
    const { x, y, type, subtype, gridSize } = {...config, ...defaultConfig};

    this._x = x;
    this._y = y;
    this._scene = scene;
    this._gridSize = gridSize;
    this._type = type;
    this._subtype = subtype as EntitySubtype;
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

  public get type(): EntityType {
    return this._type;
  }

  protected set type(value: EntityType) {
    this._type = value;
  }

  public get scene(): ISceneWithItemDrops {
    return this._scene;
  }

  protected set scene(value: ISceneWithItemDrops) {
    this._scene = value;
  }

  public get subtype(): EntitySubtype {
    return this._subtype;
  }
  protected set subtype(value: EntitySubtype) {
    this._subtype = value;
  }
  //#endregion

  //#region Methods
  /**
   * Called when another entity touches this entity.
   * @param other The other entity that touched this entity.
   */
  abstract onTouch(other: EntityModel): void;

  abstract getAnimKey(): string;

  // returns true if the entity is still active, false if it should be removed
  abstract tick(): boolean;
  //#endregion
}
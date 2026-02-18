import { EntitySubtype, EntityType, ValidSubtype } from "../EntityType";

const gridSize = 8;

export interface SceneWithItemDrops extends Phaser.Scene {
  spawnPickup(pickup: any): void;
}

export interface EntityConfig {
  x: number;
  y: number;
  type: EntityType;
  subtype: EntitySubtype;
}

export type DefaultConfig<T> = {
  [K in keyof T]: undefined extends T[K] ? Required<T>[K] : never;
};

/**
 * Base class for all entities (Actors, Pickups).
 */
export abstract class EntityModel {
  //#region Properties

  private _x: number;
  private _y: number;
  private _type: EntityType;
  private _subtype: EntitySubtype;
  private _scene: SceneWithItemDrops;

  //#endregion

  //#region Abstract Definitions

  /**
   * Called when another entity touches this entity.
   * @param other The other entity that touched this entity.
   */
  abstract onTouch(other: EntityModel): void;

  /**
   * returns true if the entity is still active, false if it should be removed
   */
  abstract tick(): boolean;

  //#endregion

  //#region Constructor
  /**
   * @param scene The Phaser scene instance.
   * @param config Configuration for entity initialization.
   */
  constructor(scene: SceneWithItemDrops, config: EntityConfig) {
    const { x, y, type, subtype } = config;

    this._x = x;
    this._y = y;
    this._scene = scene;
    this._type = type;
    this._subtype = subtype as EntitySubtype;
  }
  //#endregion

  //#region Accessors
  public get isOnXGrid(): boolean {
    return this.x % gridSize === 0;
  }

  public get isOnYGrid(): boolean {
    return this.y % gridSize === 0;
  }

  public get isOnGrid(): boolean {
    return this.isOnXGrid && this.isOnYGrid;
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get type(): EntityType {
    return this._type;
  }

  public get scene(): SceneWithItemDrops {
    return this._scene;
  }

  public get subtype(): EntitySubtype {
    return this._subtype;
  }
  //#endregion

  //#region Mutators

  protected set x(value: number) {
    this._x = value;
  }

  protected set y(value: number) {
    this._y = value;
  }

  protected set type(value: EntityType) {
    this._type = value;
  }

  protected set scene(value: SceneWithItemDrops) {
    this._scene = value;
  }

  protected set subtype(value: EntitySubtype) {
    this._subtype = value;
  }

  //#endregion

  //#region Methods

  /** Snaps the X coordinate to the grid. */
  public snapToGridX(): void {
    this.x = Math.round(this.x / gridSize) * gridSize;
  }

  /** Snaps the Y coordinate to the grid. */
  public snapToGridY(): void {
    this.y = Math.round(this.y / gridSize) * gridSize;
  }

  /** Snaps both X and Y coordinates to the grid. */
  public snapToGrid(): void {
    this.snapToGridX();
    this.snapToGridY();
  }

  //#endregion
}
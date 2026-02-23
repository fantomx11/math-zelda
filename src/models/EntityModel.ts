import { SubtypeToType } from "../Util.js";
import { EntitySubtype, EntityType } from "../Enums.js";
import { gameState } from "../GameState.js";

//#region Config

export interface EntityConfig {
  x: number;
  y: number;
  subtype: EntitySubtype;
}

export type DefaultConfig<T> = {
  [K in keyof T]: undefined extends T[K] ? Required<T>[K] : never;
};

//#endregion

/**
 * Base class for all entities (Actors, Pickups).
 */
export abstract class EntityModel {
  /**
   * @param scene The Phaser scene instance.
   * @param config Configuration for entity initialization.
   */
  constructor(config: EntityConfig) {
    const { x, y, subtype } = config;

    this._x = x;
    this._y = y;
    this._subtype = subtype;
  }

  //#region Position

  private _x: number;
  private _y: number;

  public get isOnXGrid(): boolean {
    return this.x % gameState.currentRoom.gridSize === 0;
  }

  public get isOnYGrid(): boolean {
    return this.y % gameState.currentRoom.gridSize === 0;
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

  protected set x(value: number) {
    this._x = value;
  }

  protected set y(value: number) {
    this._y = value;
  }

  public snapToGridX(): void {
    const gridSize = gameState.currentRoom.gridSize;
    this.x = Math.round(this.x / gridSize) * gridSize;
  }

  /** Snaps the Y coordinate to the grid. */
  public snapToGridY(): void {
    const gridSize = gameState.currentRoom.gridSize;
    this.y = Math.round(this.y / gridSize) * gridSize;
  }

  /** Snaps both X and Y coordinates to the grid. */
  public snapToGrid(): void {
    this.snapToGridX();
    this.snapToGridY();
  }

  public place(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  //#endregion

  //#region Identity

  private _subtype: EntitySubtype;

  public get entityId(): string {
    return `${this.subtype}`;
  }


  public get type(): EntityType {
    return SubtypeToType[this._subtype];
  }

  public get subtype(): EntitySubtype {
    return this._subtype;
  }

  protected set subtype(value: EntitySubtype) {
    this._subtype = value;
  }


  //#endregion

  //#region Logic
  abstract readonly isBlocking: boolean;

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
}
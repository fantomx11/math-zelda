import { RoomModel } from './RoomModel';
import { EntityConfig, EntityModel, ISceneWithItemDrops } from './EntityModel.js';
import { MathZeldaEvent } from '../Event';

//#region Types and Interfaces
export enum Direction {
  up = "up", down = "down", left = "left", right = "right"
}

/**
 * Interface for Actor State Pattern.
 */
export interface IActorState {
  enter(actor: ActorModel): void;
  update(actor: ActorModel, room: RoomModel, inputDir: Direction | null): void;
  getAnimKey(actor: ActorModel): string;
}

/**
 * Configuration for Actor initialization.
 */
interface ActorConfig extends EntityConfig {
  hp?: number;
  maxHp?: number;
  speed?: number;
}
//#endregion

//#region State Implementations

/**
 * State representing an Actor standing still.
 */
export class IdleState implements IActorState {
  enter(actor: ActorModel) {
    actor.snapToGrid();
  }

  update(actor: ActorModel, room: RoomModel, inputDir: Direction | null) {
    if (inputDir) {
      actor.currentDir = inputDir;
      actor.changeState(new MoveState());
    }
  }

  getAnimKey(actor: ActorModel): string {
    return actor.getIdleAnimKey();
  }
}

/**
 * State representing an Actor moving through the grid.
 */
export class MoveState implements IActorState {
  private remainingStep: number = 0;

  enter(actor: ActorModel) {
    this.remainingStep = actor.gridSize;
    // Perpendicular snap (Lane alignment)
    if (actor.currentDir === Direction.left || actor.currentDir === Direction.right) {
      actor.snapToGridY();
    } else {
      actor.snapToGridX();
    }
  }

  update(actor: ActorModel, room: RoomModel, inputDir: Direction | null) {
    let dx = 0, dy = 0;
    if (actor.currentDir === Direction.left) dx = -actor.speed;
    if (actor.currentDir === Direction.right) dx = actor.speed;
    if (actor.currentDir === Direction.up) dy = -actor.speed;
    if (actor.currentDir === Direction.down) dy = actor.speed;

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;

    if (actor.canPass(nextX, nextY, room)) {
      actor.moveTo(nextX, nextY);
      this.remainingStep -= actor.speed;
    } else {
      this.remainingStep = 0;
    }

    if (this.remainingStep <= 0) {
      actor.snapToGrid();

      if (inputDir === actor.currentDir) {
        this.remainingStep = actor.gridSize;
      } else if (inputDir) {
        actor.currentDir = inputDir;
        actor.changeState(new MoveState());
      } else {
        actor.changeState(new IdleState());
      }
    }
  }

  getAnimKey(actor: ActorModel) {
    return `${actor.type}_${actor.currentDir}`;
  }
}

/**
 * State representing an Actor being pushed back by damage.
 */
export class KnockbackState implements IActorState {
  private dist: number = 32;
  constructor(private srcX: number, private srcY: number) { }

  enter(actor: ActorModel) {
    const dx = this.srcX - actor.x;
    const dy = this.srcY - actor.y;
    if (Math.abs(dx) > Math.abs(dy)) actor.currentDir = dx > 0 ? Direction.right : Direction.left;
    else actor.currentDir = dy > 0 ? Direction.down : Direction.up;
  }

  update(actor: ActorModel, room: RoomModel, inputDir: Direction | null) {
    const speed = 2;
    let dx = 0, dy = 0;
    if (actor.currentDir === Direction.left) dx = speed;
    if (actor.currentDir === Direction.right) dx = -speed;
    if (actor.currentDir === Direction.up) dy = speed;
    if (actor.currentDir === Direction.down) dy = -speed;

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;

    if (actor.canPass(nextX, nextY, room)) {
      actor.moveTo(nextX, nextY);
    }

    this.dist -= speed;
    if (this.dist <= 0) {
      actor.changeState(new IdleState());
    }
  }

  getAnimKey(actor: ActorModel) { return ''; }
}
//#endregion

/**
 * Base class for all moving entities (Player, Monsters).
 */
export abstract class ActorModel extends EntityModel {
  //#region Properties
  private _speed: number;
  private _currentDir: Direction;
  private _hp: number;
  private _maxHp: number;
  private _invincibleTimer: number;
  private _state: IActorState;
  //#endregion

  //#region Constructor
  constructor(x: number, y: number, type: string, subtype: string, scene: ISceneWithItemDrops, config?: ActorConfig) {
    super(x, y, type, subtype, scene, config);

    const { hp = 1, maxHp = hp, speed = 1 } = config || {};

    this._currentDir = Direction.down;
    this._hp = hp;
    this._maxHp = maxHp;
    this._speed = speed;
    this._invincibleTimer = 0;
    this._state = new IdleState();
  }
  //#endregion

  //#region Accessors
  public get speed(): number { return this._speed; }
  protected set speed(value: number) { this._speed = value; }

  public get currentDir(): Direction { return this._currentDir; }
  public set currentDir(value: Direction) { this._currentDir = value; }

  public get hp(): number { return this._hp; }
  protected set hp(value: number) {
    value = Math.max(0, Math.min(this._maxHp, value));
    if (value === this._hp) return;
    this._hp = value;
    this.scene.events.emit(MathZeldaEvent.ACTOR_HP_CHANGED, { hp: this._hp, actor: this });
  }

  public get state(): IActorState { return this._state; }
  protected set state(value: IActorState) { this._state = value; }

  public get isDead(): boolean { return this._hp <= 0; }

  public get isInvincible(): boolean { return this._invincibleTimer > Date.now(); }

  public get alpha(): number { return this.isInvincible ? 0.5 : 1; }
  //#endregion

  //#region Methods
  public changeState(newState: IActorState): void {
    this._state = newState;
    this._state.enter(this);
  }

  public process(inputDir: Direction | null, room: RoomModel): void {
    this._state.update(this, room, inputDir);
  }

  public canPass(nx: number, ny: number, room: RoomModel): boolean {
    const cs = room.cornerSize;
    const fs = room.floorSize;
    const limit = cs + fs;
    const margin = 8;

    const inFloorX = nx >= cs + margin && nx <= limit - margin;
    const inFloorY = ny >= cs + margin && ny <= limit - margin;
    if (inFloorX && inFloorY) return true;

    const mid = 128;
    const dw = 0;
    if (room.wallTypes.n === 'open' && nx >= mid - dw && nx <= mid + dw && ny < cs + margin) return true;
    if (room.wallTypes.s === 'open' && nx >= mid - dw && nx <= mid + dw && ny > limit - margin) return true;
    if (room.wallTypes.w === 'open' && ny >= mid - dw && ny <= mid + dw && nx < cs + margin) return true;
    if (room.wallTypes.e === 'open' && ny >= mid - dw && ny <= mid + dw && nx > limit - margin) return true;

    return false;
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    if (this.isInvincible) return false;

    this.hp -= amount;
    this._invincibleTimer = Date.now() + 1000;
    this.changeState(new KnockbackState(srcX, srcY));

    this.scene.events.emit(MathZeldaEvent.ACTOR_HURT, { amount: this._hp, actor: this });

    return this.isDead;
  }

  public ai(room: RoomModel): void { }

  public getAnimKey(): string {
    return this._state.getAnimKey(this);
  }

  public getIdleAnimKey(): string {
    return `${this.subtype}_${this._currentDir}_idle`;
  }

  /** Snaps the X coordinate to the grid. */
  public snapToGridX(): void {
    this.x = Math.round(this.x / this.gridSize) * this.gridSize;
  }

  /** Snaps the Y coordinate to the grid. */
  public snapToGridY(): void {
    this.y = Math.round(this.y / this.gridSize) * this.gridSize;
  }

  /** Snaps both X and Y coordinates to the grid. */
  public snapToGrid(): void {
    this.snapToGridX();
    this.snapToGridY();
  }

  /** Updates the actor's position. */
  public moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public heal(amount: number): boolean {
    if (amount <= 0 || this.hp >= this._maxHp) return false;
    this.hp += amount;
    return true;
  }

  public onDeath(scene: ISceneWithItemDrops): void { }
  //#endregion
}
import { RoomModel } from './RoomModel';
import { DefaultConfig, EntityConfig, EntityModel } from './EntityModel.js';
import { MathZeldaEvent } from '../Event';
import { QueuedAction } from '../actions/ActorAction';
import { EventBus } from '../EventBus';
import { gameState } from '../GameState';

//#region Types and Interfaces
export enum Direction {
  up = "up", down = "down", left = "left", right = "right"
}

export enum ActorStateType {
  WAIT,
  IDLE,
  MOVE,
  ATTACK,
  SPAWN,
  KNOCKBACK,
  DYING,
  DEAD
}

export type StateDefinitions = {
  [K in ActorStateType]: ActorState
}

/**
 * Interface for Actor State Pattern.
 */
export interface ActorState {
  enter(actor: ActorModel): void;
  update(actor: ActorModel): void;
  exit(actor: ActorModel): void;
}

interface ActorOptionalConfig {
  currentHp?: number;
  maxHp?: number;
  speed?: number;
}

interface ActorRequiredConfig {
  stateDefinitions: StateDefinitions;
}

/**
 * Configuration for Actor initialization.
 */
export type ActorSpecificConfig = ActorOptionalConfig & ActorRequiredConfig;

const defaultConfig: ActorOptionalConfig = {
  currentHp: 1,
  maxHp: 1,
  speed: 0.5
};

export type ActorConfig = EntityConfig & ActorSpecificConfig;
//#endregion

//#region State Implementations

/**
 * State representing an Actor standing still.
 */
export const IdleState: ActorState = {
  enter(actor: ActorModel) {
    actor.snapToGrid();
  },
  update(actor: ActorModel) {  
    // No movement, just wait for input
  },
  exit(actor: ActorModel) { }
};

/**
 * State representing an Actor moving through the grid.
 */
export const MoveState: ActorState = {
  enter(actor: ActorModel) {
    // Perpendicular snap (Lane alignment)
    if (actor.currentDir === Direction.left || actor.currentDir === Direction.right) {   
      actor.snapToGridY();
    } else {
      actor.snapToGridX();
    } 
  },
  update(actor: ActorModel) {


    let dx = 0, dy = 0;
    if (actor.currentDir === Direction.left) dx = -actor.speed;
    if (actor.currentDir === Direction.right) dx = actor.speed;
    if (actor.currentDir === Direction.up) dy = -actor.speed;
    if (actor.currentDir === Direction.down) dy = actor.speed;  

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;



    if (actor.canPass(nextX, nextY, gameState.currentRoom)) {
      actor.moveTo(nextX, nextY); 
    } else {
      actor.snapToGrid();
    }
  },
  exit(actor: ActorModel) {
    actor.snapToGrid();
  }
}; 

/**
 * State representing an Actor being pushed back by damage.
 */
export const KnockbackState: ActorState = {
  enter(actor: ActorModel) {
    const data = actor.stateData as { srcX: number, srcY: number, dist: number };
    data.dist = 32;
    const dx = data.srcX - actor.x;
    const dy = data.srcY - actor.y;
    if (Math.abs(dx) > Math.abs(dy)) actor.face(dx > 0 ? Direction.right : Direction.left);
    else actor.face(dy > 0 ? Direction.down : Direction.up);
  },

  update(actor: ActorModel) {
    const data = actor.stateData as { dist: number };
    const speed = 2;
    let dx = 0, dy = 0;
    if (actor.currentDir === Direction.left) dx = speed;
    if (actor.currentDir === Direction.right) dx = -speed;
    if (actor.currentDir === Direction.up) dy = speed;
    if (actor.currentDir === Direction.down) dy = -speed;

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;

    if (actor.canPass(nextX, nextY, gameState.currentRoom)) {
      actor.moveTo(nextX, nextY);
    }

    data.dist -= speed;
    if (data.dist <= 0) {
      actor.changeState(IdleState);
    }
  },

  exit(actor: ActorModel) { actor.stateData = null; },
};
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
  private _state: ActorState;
  public stateData: any = null;
  private _actionQueue: QueuedAction[] = [];
  private _stateDefinitions: StateDefinitions;

  //#endregion

  //#region Constructor
  constructor(config: ActorConfig) {
    super(config);

    const { currentHp, maxHp, speed, stateDefinitions}: Required<ActorConfig> = <Required<ActorConfig>>{...config, ...defaultConfig};

    this._stateDefinitions = stateDefinitions;
    this._currentDir = Direction.down;
    this._hp = currentHp || maxHp;
    this._maxHp = maxHp;
    this._speed = speed;
    this._invincibleTimer = 0;
    this._state = this._stateDefinitions[ActorStateType.IDLE];
  }

  //#endregion

  //#region Accessors

  public get speed(): number { return this._speed; }
  public get currentDir(): Direction { return this._currentDir; }
  public get hp(): number { return this._hp; }
  public get state(): ActorState { return this._state; }
  public get isAlive(): boolean { return this._hp > 0; }
  public get isInvincible(): boolean { return this._invincibleTimer > Date.now(); }
  public get alpha(): number { return this.isInvincible ? 0.5 : 1; }

  //#endregion

  //#region Mutators
  
  protected set speed(value: number) { this._speed = value; }

  protected set currentDir(value: Direction) { this._currentDir = value; }
  
  protected set hp(value: number) {
    value = Math.max(0, Math.min(this._maxHp, value));
    if (value === this._hp) return;
    this._hp = value;
    EventBus.emit(MathZeldaEvent.ActorHpChanged, { hp: this._hp, actor: this });
  }
  
  protected set state(value: ActorState) { this._state = value; }
  
  //#endregion

  //#region Methods
  public queueAction(action: QueuedAction): void {
    this._actionQueue.push(action);
  }

  public clearActionQueue(): void {
    this._actionQueue = [];
  }

  public nextAction(): QueuedAction | undefined {
    return this._actionQueue[0];
  }

  public finishAction(): void {
    this._actionQueue.shift();
  }

  public changeState(newState: ActorState): void {
    if(this.state) {
      this.state.exit(this);
    }
    this.state = newState;
    this.state.enter(this);
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

    this.clearActionQueue();

    this.stateData = { srcX, srcY };
    this.changeState(KnockbackState);

    EventBus.emit(MathZeldaEvent.ActorHurt, { amount: this._hp, actor: this });

    return true;
  }

  public tick(): boolean {
    this.ai();

    this.state.update(this);

    return this.isAlive;
  }

  public face(direction: Direction): void {
    this.currentDir = direction;
  }

  public abstract ai(): void;

  public move(direction: Direction, room: RoomModel): void {
    this.face(direction);
    if(direction == Direction.up || direction == Direction.down) {
      this.snapToGridX();
      this.y += direction == Direction.up ? -this.speed : this.speed;
    } else {
      this.snapToGridY();
      this.x += direction == Direction.left ? -this.speed : this.speed;
    }
  }

  abstract attack(direction: Direction, room: RoomModel): void;

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

  public getEntityId(): string {
    return `${this.subtype}_${this.currentDir}`;
  }
  
  //#endregion
}
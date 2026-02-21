import { RoomModel } from './RoomModel';
import { DefaultConfig, EntityConfig, EntityModel } from './EntityModel.js';
import { MathZeldaEvent } from '../Event';
import { QueuedAction } from '../actions/ActorAction';
import { EventBus } from '../EventBus';
import { gameState } from '../GameState';
import { EntityType } from '../Enums';

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

enum MoveReturnValue {
  Complete,
  Blocked,
  Incomplete
}

export type StateDefinitions = {
  [K in ActorStateType]: ActorState
}

/**
 * Interface for Actor State Pattern.
 */
export type ActorState = {
  enter: (actor: ActorModel, payload: any) => void;
  update: (actor: ActorModel) => void;
  exit?: (actor: ActorModel) => void;
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
};

/**
 * State representing an Actor moving through the grid.
 */
export const MoveState: ActorState = {
  enter(actor: ActorModel, payload: any) {
    const { x, y } = payload;
    actor.stateData = { targetX: x, targetY: y, stepsTaken: 0 };

    const dx = x - actor.x;
    const dy = y - actor.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      actor.face(dx > 0 ? Direction.right : Direction.left);
    } else {
      actor.face(dy > 0 ? Direction.down : Direction.up);
    }
  },

  update(actor: ActorModel) {
    const { targetX, targetY } = actor.stateData;
    const result = actor.walk();

    if (result === MoveReturnValue.Complete) {
      if (Math.abs(actor.x - targetX) < 1 && Math.abs(actor.y - targetY) < 1) {
        actor.snapToGrid();
        actor.finishAction();
        actor.changeState(IdleState);
        return;
      }

      actor.stateData.stepsTaken++;

      const dx = targetX - actor.x;
      const dy = targetY - actor.y;
      let changeDir = false;

      if (actor.stateData.stepsTaken >= 2) {
        changeDir = true;
      } else if (actor.currentDir === Direction.right && dx <= 0) changeDir = true;
      else if (actor.currentDir === Direction.left && dx >= 0) changeDir = true;
      else if (actor.currentDir === Direction.down && dy <= 0) changeDir = true;
      else if (actor.currentDir === Direction.up && dy >= 0) changeDir = true;

      if (changeDir) {
        actor.stateData.stepsTaken = 0;
        if (Math.abs(dx) >= Math.abs(dy)) {
          if (dx !== 0) actor.face(dx > 0 ? Direction.right : Direction.left);
          else if (dy !== 0) actor.face(dy > 0 ? Direction.down : Direction.up);
        } else {
          if (dy !== 0) actor.face(dy > 0 ? Direction.down : Direction.up);
          else if (dx !== 0) actor.face(dx > 0 ? Direction.right : Direction.left);
        }
      }
    } else if (result === MoveReturnValue.Blocked) {
      actor.snapToGrid();
      actor.stateData.stepsTaken = 0;
      const dx = targetX - actor.x;
      const dy = targetY - actor.y;

      if (actor.currentDir === Direction.left || actor.currentDir === Direction.right) {
        if (dy !== 0) actor.face(dy > 0 ? Direction.down : Direction.up);
        else {
          actor.finishAction();
          actor.changeState(IdleState);
        }
      } else {
        if (dx !== 0) actor.face(dx > 0 ? Direction.right : Direction.left);
        else {
          actor.finishAction();
          actor.changeState(IdleState);
        }
      }
    }
  }
};

/**
 * State representing an Actor being pushed back by damage.
 */
export const KnockbackState: ActorState = {
  enter(actor: ActorModel, payload: any) {
    let dx = payload.srcX - actor.x;
    let dy = payload.srcY - actor.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if(dx > 0) {
        actor.face(Direction.right);
        dx = -2;
        dy = 0;
      } else {
        actor.face(Direction.left);
        dx = 2
        dy = 0;
      }
    } else {
      if(dy > 0) {
        actor.face(Direction.down);
        dx = 0;
        dy = -2;
      } else {
        actor.face(Direction.up);
        dx = 0;
        dy = 2;
      }      
    }
    const dist = 32;

    actor.stateData = { dist, dx, dy };
  },

  update(actor: ActorModel) {
    const {dist, dx, dy} = actor.stateData;

    if(dist < Math.abs(dx) || dist < Math.abs(dy)) {
      actor.snapToGrid();
      actor.changeState(IdleState);
      return
    }

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;

    if(!gameState.currentRoom.isPassable(nextX, nextY, actor.type === EntityType.Player)) {
      actor.snapToGrid();
    } else {
      actor.setPosition(nextX, nextY);
    }

    actor.stateData.dist -= Math.max(Math.abs(dx), Math.abs(dy));
  },

  exit(actor: ActorModel) {},
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

    const { currentHp, maxHp, speed, stateDefinitions }: Required<ActorConfig> = <Required<ActorConfig>>{ ...config, ...defaultConfig };

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
  public get isBlocking(): boolean { return true; }

  public get isOnXGrid(): boolean {
    const gridSize = gameState.currentRoom.gridSize;
    const nearest = Math.round(this.x / gridSize) * gridSize;
    return Math.abs(this.x - nearest) <= this.speed;
  }

  public get isOnYGrid(): boolean {
    const gridSize = gameState.currentRoom.gridSize;
    const nearest = Math.round(this.y / gridSize) * gridSize;
    return Math.abs(this.y - nearest) <= this.speed;
  }

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
    if (this.state && this.state.exit) {
      this.state.exit(this);
    }
    this.state = newState;
    // Pass data from the current action queue item to the new state's enter method.
    // This is how MoveState gets its target coordinates.
    this.state.enter(this, this.nextAction()?.data);
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

  public face(direction: Direction): boolean {
    if (this.currentDir === direction) return true;
    if (!this.isOnGrid) return false;

    this.snapToGrid();
    this.currentDir = direction;
    return true;
  }

  public walk(): MoveReturnValue {
    const room = gameState.currentRoom;
    const gridSize = room.gridSize;
    const onGrid = this.isOnGrid;

    const impulseX = this.currentDir === Direction.left ? -1 : this.currentDir === Direction.right ? 1 : 0;
    const impulseY = this.currentDir === Direction.up ? -1 : this.currentDir === Direction.down ? 1 : 0;

    if (onGrid) {
      let nextX = this.x + gridSize * impulseX;
      let nextY = this.y + gridSize * impulseY;

      if (!room.isPassable(nextX, nextY, this.type === EntityType.Player)) {
        this.snapToGrid();
        return MoveReturnValue.Blocked;
      }
    }

    this.x += impulseX * this.speed;
    this.y += impulseY * this.speed;

    if (this.isOnGrid) {
      return MoveReturnValue.Complete;
    } else {
      return MoveReturnValue.Incomplete;
    }
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public abstract ai(): void;

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
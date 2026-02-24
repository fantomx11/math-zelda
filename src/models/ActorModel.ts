import { EntityConfig, EntityModel } from './EntityModel.js';
import { MathZeldaEvent } from '../Event';
import { QueuedAction } from '../actions/ActorAction';
import { EventBus } from '../EventBus';
import { gameState } from '../GameState';
import { ActionType, ActorRequiredStateType, ActorStateType, Direction, EntityType, MoveReturnValue } from '../Enums';

//#region State Definitions

/**
 * Interface for Actor State Pattern.
 */
export type ActorState = {
  type: ActorStateType;
  enter: (actor: ActorModel, payload: any) => void;
  update: (actor: ActorModel) => void;
  exit?: (actor: ActorModel) => void;
  [key: string]: any; // Allow additional properties for state-specific data
}
//#endregion

//#region Config Definitions

interface ActorOptionalConfig {
  currentHp?: number;
  maxHp?: number;
  speed?: number;
}

interface ActorRequiredConfig {
  states: readonly ActorState[];
}

/**
 * Configuration for Actor initialization.
 */
export type ActorSpecificConfig = ActorOptionalConfig & ActorRequiredConfig;

const defaultConfig: ActorOptionalConfig & Partial<ActorRequiredConfig> = {
  currentHp: 1,
  maxHp: 1,
  speed: 0.5,
  states: []
};

export type ActorConfig = EntityConfig & ActorSpecificConfig;

//#endregion

//#region State Implementations

/**
 * State representing an Actor standing still.
 */
export const IdleState: ActorState = {
  type: ActorStateType.IDLE,
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
  type: ActorStateType.MOVE,
  directionFromXY: (dx: number, dy: number): Direction => {
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0 ? Direction.right : Direction.left;
    } else {
      return dy > 0 ? Direction.down : Direction.up;
    }
  },

  enter(actor: ActorModel, payload: any) {
    const { x, y } = payload;
    actor.currentAction!.data = { x, y };

    const dx = x - actor.x;
    const dy = y - actor.y;

    actor.face(this.directionFromXY(dx, dy));
  },

  update(actor: ActorModel) {
    const { targetX: x, targetY: y } = actor.currentAction?.data as any;
    const result = actor.walk();

    if (result === MoveReturnValue.Complete) {
      if (Math.abs(actor.x - x) < 1 && Math.abs(actor.y - y) < 1) {
        actor.snapToGrid();
        actor.finishAction();
        actor.changeState(IdleState);
        return;
      }

      actor.stateData.stepsTaken++;

      const dx = x - actor.x;
      const dy = y - actor.y;
      let changeDir = false;

      if (actor.stateData.stepsTaken >= 2) {
        changeDir = true;
      } else if (actor.currentDir === Direction.right && dx <= 0) {
        changeDir = true;
      } else if (actor.currentDir === Direction.left && dx >= 0) {
        changeDir = true;
      } else if (actor.currentDir === Direction.down && dy <= 0) {
        changeDir = true;
      } else if (actor.currentDir === Direction.up && dy >= 0) {
        changeDir = true;
      }

      if (changeDir) {
        actor.stateData.stepsTaken = 0;
        actor.face(this.directionFromXY(dx, dy));
      }
    } else if (result === MoveReturnValue.Blocked) {
      actor.snapToGrid();
      actor.stateData.stepsTaken = 0;
      const dx = x - actor.x;
      const dy = y - actor.y;

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
  type: ActorStateType.KNOCKBACK,
  enter(actor: ActorModel, payload: any) {
    let dx = payload.srcX - actor.x;
    let dy = payload.srcY - actor.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        actor.face(Direction.right);
        dx = -2;
        dy = 0;
      } else {
        actor.face(Direction.left);
        dx = 2
        dy = 0;
      }
    } else {
      if (dy > 0) {
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

    actor.currentAction!.data = { dist, dx, dy };
  },

  update(actor: ActorModel) {
    const { dist, dx, dy } = actor.currentAction!.data as any;

    if (dist < Math.abs(dx) || dist < Math.abs(dy)) {
      actor.snapToGrid();
      actor.changeState(IdleState);
      return
    }

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;

    if (!gameState.currentRoom.isPassable(nextX, nextY, actor.type === EntityType.Player)) {
      actor.snapToGrid();
    } else {
      actor.setPosition(nextX, nextY);
    }

    actor.stateData.dist -= Math.max(Math.abs(dx), Math.abs(dy));
  },

  exit(actor: ActorModel) { },
};

export const DyingState: ActorState = {
  type: ActorStateType.DYING,
  enter(actor, payload) {
    actor.clearActionQueue();
  },
  update(actor:ActorModel) {

  },
  exit(actor) {

  }
};

export const DeadState: ActorState = {
  type: ActorStateType.DEAD,
  enter(actor, payload) {
    EventBus.emit(MathZeldaEvent.ActorDied, {actor: actor});
  },
  update(actor:ActorModel) {

  },
  exit(actor) {
  }
};

//#endregion

/**
 * Base class for all moving entities (Player, Monsters).
 */
export abstract class ActorModel extends EntityModel {
  constructor(config: ActorConfig) {
    super(config);

    const { currentHp, maxHp, speed, states }: Required<ActorConfig> = { ...config, ...defaultConfig } as Required<ActorConfig>;

    this._stateDefinitions = new Map(states.map(s => [s.type, s]));
    this._currentDir = Direction.down;
    this._hp = currentHp || maxHp;
    this._maxHp = maxHp;
    this._speed = speed;
    this._state = this._stateDefinitions.get(ActorStateType.IDLE)!;

  }

  //#region Action Queue
  private _actionQueue: QueuedAction[] = [];

  public get currentAction(): QueuedAction | undefined {
    return this._actionQueue[0];
  }

  public queueAction(action: QueuedAction): void {
    this._actionQueue.push(action);
  }

  public queuePriorityAction(action: QueuedAction): void {
    this._actionQueue.unshift(action);
  }

  public hasQueuedAction(type: ActionType): boolean {
    return this._actionQueue.some(a => a.type === type);
  }

  public clearActionQueue(): void {
    this._actionQueue = [];
  }

  public nextAction(): QueuedAction | undefined {
    return this._actionQueue[1];
  }

  public finishAction(): void {
    this._actionQueue.shift();
  }

  //#endregion

  //#region State Machine
  private _state: ActorState;
  public stateData: any = null;
  private _stateDefinitions: Map<ActorStateType, ActorState>;

  public get state(): ActorState { return this._state; }
  protected set state(value: ActorState) { this._state = value; }

  public changeState(newState: ActorState): void {
    if (this.state && this.state.exit) {
      this.state.exit(this);
    }
    this.state = newState;
    // Pass data from the current action queue item to the new state's enter method.
    // This is how MoveState gets its target coordinates.
    this.state.enter(this, this.currentAction?.data);
  }

  public changeStateByType(stateType: ActorStateType): void {
    const newState = this._stateDefinitions.get(stateType);
    if (!newState) {
      console.error(`State with type ${ActorStateType[stateType]} not found for this actor.`);
      return;
    }
    // Note: This doesn't pass a payload. Consider if one is needed.
    this.changeState(newState);
  }

  //#endregion

  //#region Position

  private _speed: number;
  private _currentDir: Direction;

  public get speed(): number { return this._speed; }
  public get currentDir(): Direction { return this._currentDir; }
  protected set currentDir(value: Direction) { this._currentDir = value; }

  protected set speed(value: number) { this._speed = value; }

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

  //#endregion

  //#region Health
  private _hp: number;
  private _maxHp: number;

  public get hp(): number { return this._hp; }
  public get isAlive(): boolean { return this.hp > 0; }
  public get isActive(): boolean { return this.state.type !== ActorStateType.DEAD; }

  protected set hp(value: number) {
    value = Math.max(0, Math.min(this._maxHp, value));
    if (value === this._hp) return;
    this._hp = value;
    EventBus.emit(MathZeldaEvent.ActorHpChanged, { hp: this._hp, actor: this });
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    this.hp -= amount;

    if (this.hp <= 0) {
      this.changeState(this._stateDefinitions.get(ActorStateType.DYING)!);
    } else {
      this.clearActionQueue();

      this.stateData = { srcX, srcY };
      this.changeState(KnockbackState);

      EventBus.emit(MathZeldaEvent.ActorHurt, { amount: this._hp, actor: this });
    }

    return true;
  }

  public heal(amount: number): boolean {
    if (amount <= 0 || this.hp >= this._maxHp) return false;
    this.hp += amount;
    return true;
  }

  public onDeath(): void {
    this.changeState(DeadState);
  }
  //#endregion

  //#region Logical State
  public get isBlocking(): boolean { return true; }

  public get entityId(): string {
    return `${this.subtype}_${this.currentDir}`;
  }

  public tick(): boolean {
    // An action is already queued or being processed, do nothing until it's done.
    if (this.currentAction) {
      if (this.state === IdleState && this.currentAction?.type === ActionType.MOVE) {
        this.changeState(MoveState);
      }
    } else if (this.state !== KnockbackState) {
      this.ai();
    }

    this.state.update(this);

    return this.isAlive;
  }

  abstract ai(): void;
  //#endregion
}
import { EntityConfig, EntityModel } from './EntityModel.js';
import { MathZeldaEvent } from '../Event';
import { EventBus } from '../EventBus';
import { gameState } from '../GameState';
import { ActorStateType, Direction, EntityType, MoveReturnValue } from '../Enums';
import { ActorState } from '../state/ActorState.js';
import { IdleState } from '../state/IdleState.js';
import { MoveState } from '../state/MoveState.js';
import { KnockbackState } from '../state/KnockbackState.js';
import { DeadState } from '../state/DeadState.js';
import { DyingState } from '../state/DyingState.js';
import { WaitState } from '../state/WaitState.js';

export interface StateCommand {
  state: ActorState;
  payload?: any;
}

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

const defaultStates = {
  [ActorStateType.IDLE]: IdleState,
  [ActorStateType.MOVE]: MoveState,
  [ActorStateType.KNOCKBACK]: KnockbackState,
  [ActorStateType.DYING]: DyingState,
  [ActorStateType.DEAD]: DeadState,
  [ActorStateType.WAIT]: WaitState,
  [ActorStateType.ATTACK]: IdleState
} as const;

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
  }

  //#region State Machine
  private _stateQueue: StateCommand[] = [];
  private _stateDefinitions: Map<ActorStateType, ActorState>;

  public get currentState(): StateCommand {
    if (this._stateQueue.length === 0) {
      return {
        state: this.getStateFromType(ActorStateType.IDLE)!
      };
    }

    return this._stateQueue[0];
  }

  public queueState(state: ActorState | ActorStateType, payload?: any): void {
    if (typeof state === 'string') {
      state = this.getStateFromType(state)!;
    }

    this._stateQueue.push({ state, payload });
  }

  public queuePriorityState(state: ActorState | ActorStateType, payload?: any): void {
    if (typeof state === 'string') {
      state = this.getStateFromType(state)!;
    }

    this._stateQueue.unshift({ state, payload });
  }

  public hasQueuedState(type: ActorStateType): boolean {
    return this._stateQueue.some(({ state }) => state.type === type);
  }

  public clearStateQueue(): void {
    this._stateQueue = [];
  }

  public nextState(): StateCommand | undefined {
    return this._stateQueue[1];
  }

  public finishState(): void {
    if (this.currentState.state.exit) {
      this.currentState.state.exit(this);
    }

    this._stateQueue.shift();

    this.currentState.state.enter(this);
  }

  public getStateFromType(ActorStateType: ActorStateType): ActorState {
    let state = this._stateDefinitions.get(ActorStateType);
    if (!state) {
      state = defaultStates[ActorStateType];
    }
    return state;
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

      if (!room.isPassable(nextX, nextY, this.type === EntityType.Player, [this])) {
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
  public get isActive(): boolean { return this.currentState.state.type !== ActorStateType.DEAD; }

  protected set hp(value: number) {
    value = Math.max(0, Math.min(this._maxHp, value));
    if (value === this._hp) return;
    this._hp = value;
    EventBus.emit(MathZeldaEvent.ActorHpChanged, { hp: this._hp, actor: this });
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    this.hp -= amount;

    if (this.hp <= 0) {
      this.clearStateQueue();
      this.queueState(this.getStateFromType(ActorStateType.DYING));
    } else {
      this.clearStateQueue();

      this.queueState(this.getStateFromType(ActorStateType.KNOCKBACK), { srcX, srcY });

      EventBus.emit(MathZeldaEvent.ActorHurt, { amount: this._hp, actor: this });
    }

    return true;
  }

  public heal(amount: number): boolean {
    if (amount <= 0 || this.hp >= this._maxHp) return false;
    this.hp += amount;
    return true;
  }

  public onAnimationComplete(): void {
    this.finishState();
  }
  //#endregion

  //#region Logical State
  public get isBlocking(): boolean { return true; }

  public get entityId(): string {
    return `${this.subtype}_${this.currentDir}`;
  }

  public tick(): boolean {
    if (this.currentState.state.type === ActorStateType.IDLE) {
      this.ai();
    }

    this.currentState.state.update(this);

    return this.isAlive;
  }

  abstract ai(): void;
  //#endregion
}
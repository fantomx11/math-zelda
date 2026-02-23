import { ActorModel, IdleState, KnockbackState, MoveState, ActorState } from './ActorModel.js';
import { Direction, EntitySubtype, EntityType, ActorStateType } from '../Enums.js';
import { DirectionVectors, ItemConfig, WeaponConfig } from '../config.js';
import { MathZeldaEvent } from '../Event.js';
import { ActionType } from '../Enums.js';
import { EventBus } from '../EventBus.js';
import { gameState } from '../GameState.js';
import { ItemType, WeaponType } from '../Enums.js';
import { ValidSubtype } from '../Util.js';

//#region Config

export const AttackState: ActorState = {
  type: ActorStateType.ATTACK,
  enter: (actor: ActorModel, payload: any) => {
    // Attack logic would go here, this is a placeholder
  },
  update: (actor: ActorModel) => {
    // After attack animation/duration, finish action and return to idle
    actor.finishAction();
    actor.changeState(IdleState);
  },
};

const defaultConfig = {
  currentHp: 6,
  maxHp: 6,
  speed: 0.5,
  subtype: EntitySubtype.Link,
  states: [IdleState, MoveState, KnockbackState, AttackState]
};

//#endregion

//#region Input Definition
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  attack: boolean;
  item: boolean;
}
//#endregion

export class PlayerModel extends ActorModel {
  public input: PlayerInput = { up: false, down: false, left: false, right: false, attack: false, item: false };

  constructor(config: { x: number, y: number, subtype: ValidSubtype<typeof EntityType.Player> }) {
    super({ ...config, ...defaultConfig });

    this.currentWeapon = WeaponConfig.levels[0];
    this.currentItem = ItemConfig.levels[0];
    this.activeTriforcePieces = 0
  }

  //#region Inventory
  public currentWeapon: WeaponType;
  public currentItem: ItemType;
  public activeTriforcePieces: number;

  public get inventoryLevel(): number {
    return gameState.currentLevel + (gameState.itemFound ? 1 : 0);
  }

  public get currentAttackValue(): number {
    return this.activeTriforcePieces * 100 + WeaponConfig.levels.indexOf(this.currentWeapon) * 10 + ItemConfig.levels.indexOf(this.currentItem);
  }

  public get weapons() {
    return WeaponConfig.levels.slice(0, this.inventoryLevel);
  }

  public get triforcePieces(): number {
    return Math.max(0, Math.min(gameState.currentLevel - 10 + (gameState.itemFound ? 1 : 0), 9));
  }

  public get items() {
    return ItemConfig.levels.slice(0, this.inventoryLevel);
  }
  //#endregion

  //#region Health
  public get hp(): number {
    return super.hp;
  }

  protected set hp(value: number) {
    const oldHp = this.hp;

    super.hp = value;

    if (oldHp !== this.hp) {
      EventBus.emit(MathZeldaEvent.PlayerHpChanged);
    }
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    if (super.takeDamage(amount, srcX, srcY)) {
      EventBus.emit(MathZeldaEvent.PlayerDied);
      return true;
    }
    return false;
  }
  //#endregion

  //#region Logic
  ai(): void {
    if (this.state !== KnockbackState) {
      if (this.input.attack && this.state !== AttackState) {
        this.queuePriorityAction({ type: ActionType.ATTACK, data: { direction: this.currentDir } });
      } else if (this.state === IdleState && (this.input.down || this.input.up || this.input.left || this.input.right)) {
        if (this.input.down) this.face(Direction.down);
        else if (this.input.up) this.face(Direction.up);
        else if (this.input.left) this.face(Direction.left);
        else if (this.input.right) this.face(Direction.right);

        const step = 16;
        this.queueAction({
          type: ActionType.MOVE,
          data: {
            x: this.x + DirectionVectors[this.currentDir].x * step,
            y: this.y + DirectionVectors[this.currentDir].y * step
          }
        });
      }
    }

    const action = this.currentAction;
    if (action) {
      if (this.state === IdleState) {
        if (action.type === ActionType.ATTACK) {
          this.changeState(AttackState);
        } else if (action.type === ActionType.MOVE) {
          this.changeState(MoveState);
        }
      }
    }
  }
  //#endregion

  //#region State
  /**
   * Returns true if the player is currently in an attack state.
   */
  get isAttacking(): boolean {
    return this.state === AttackState;
  }
  //#endregion
}

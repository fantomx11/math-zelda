import { ActorModel, Direction, ActorState, IdleState, KnockbackState, AttackState } from './ActorModel.js';
import { RoomModel } from './RoomModel.js';
import { ITEM_CONFIG, WEAPON_CONFIG } from '../config.js';
import { MathZeldaEvent } from '../Event.js';
import { EntitySubtype, EntityType, ValidSubtype } from '../EntityType.js';
import { ActionType } from '../actions/ActorAction.js';
import { EventBus } from '../EventBus.js';

const defaultConfig = {
  currentHp: 6,
  maxHp: 6,
  speed: 0.5,
  subtype: EntitySubtype.LINK
};

export class PlayerModel extends ActorModel {
  public inputDir: Direction | null = null;
  public inventoryLevel: number;
  public currentWeapon: string;
  public currentItem: string;

  constructor(config: { x: number, y: number, subtype: ValidSubtype<EntityType.PLAYER> }) {
    super({type: EntityType.PLAYER, ...config, ...defaultConfig});

    this.inventoryLevel= 1;
    this.currentWeapon = this.weapons[0];
    this.currentItem = this.items[0];
  }

  public get weapons() {
    return [...WEAPON_CONFIG.names].slice(0, this.inventoryLevel);
  }

  public get items() {
    return [...ITEM_CONFIG.names];
  }

  public get hp(): number {
    return super.hp;
  }

  protected set hp(value: number) {
    const oldHp = this.hp;

    super.hp = value;

    if(oldHp !== this.hp) {
      EventBus.emit(MathZeldaEvent.PLAYER_HP_CHANGED);
    }
  }

  ai(room: RoomModel): void {
    if (this.nextAction()) return;

    if (this.inputDir) {
      // Calculate target based on small step for continuous movement feel, or grid size
      // Using 16px step for now
      let tx = this.x;
      let ty = this.y;
      const step = 16; 
      
      if (this.inputDir === Direction.left) tx -= step;
      else if (this.inputDir === Direction.right) tx += step;
      else if (this.inputDir === Direction.up) ty -= step;
      else if (this.inputDir === Direction.down) ty += step;

      this.queueAction({
        type: ActionType.MOVE,
        data: { x: tx, y: ty }
      });
    }
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    if (super.takeDamage(amount, srcX, srcY)) {
      EventBus.emit(MathZeldaEvent.PLAYER_DIED);
      return true;
    }
    return false;
  }

  /**
   * Returns true if the player is currently in an attack state.
   */
  get isAttacking(): boolean {
    return this.state instanceof AttackState;
  }

  attack(): void {
    if (this.state instanceof AttackState) return;
    if (this.state instanceof KnockbackState) return;
    
    this.queueAction({
      type: ActionType.ATTACK,
      data: { direction: this.currentDir }
    });
  }

  getAttackValue(): number {
    const weaponIdx = WEAPON_CONFIG.names.indexOf(this.currentWeapon);
    const itemIdx = ITEM_CONFIG.names.indexOf(this.currentItem);
    return (weaponIdx * 10) + itemIdx;
  }
}

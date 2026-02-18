import { ActorModel, Direction, ActorState, IdleState, KnockbackState, AttackState } from './ActorModel.js';
import { RoomModel } from './RoomModel.js';
import { ITEM_CONFIG, ItemLevels, WeaponConfig, WeaponLevels } from '../config.js';
import { MathZeldaEvent } from '../Event.js';
import { EntitySubtype, EntityType, ValidSubtype } from '../EntityType.js';
import { ActionType } from '../actions/ActorAction.js';
import { EventBus } from '../EventBus.js';
import { gameState } from '../GameState.js';
import { ItemType, WeaponType } from '../Enums.js';

const defaultConfig = {
  currentHp: 6,
  maxHp: 6,
  speed: 0.5,
  subtype: EntitySubtype.Link
};

export class PlayerModel extends ActorModel {
  public inputDir: Direction | null = null;
  public currentWeapon: WeaponType;
  public currentItem: ItemType;
  public activeTriforcePieces: number;

  constructor(config: { x: number, y: number, subtype: ValidSubtype<EntityType.Player> }) {
    super({type: EntityType.Player, ...config, ...defaultConfig});

    this.currentWeapon = WeaponLevels[0];
    this.currentItem = ItemLevels[0];
  }

  public get inventoryLevel(): number {
    return gameState.currentLevel + (gameState.itemFound ? 1 : 0);
  }

  public get currentAttackValue(): number {
    return this.activeTriforcePieces * 100 + WeaponLevels.indexOf(this.currentWeapon) * 10 + ItemLevels.indexOf(this.currentItem);
  }

  public get weapons() {
    return WeaponLevels.slice(0, this.inventoryLevel);
  }

  public get triforcePieces(): number {
    return Math.max(0, Math.min(gameState.currentLevel - 10 + (gameState.itemFound ? 1 : 0), 9));
  }

  public get items() {
    return ItemLevels;
  }

  public get hp(): number {
    return super.hp;
  }

  protected set hp(value: number) {
    const oldHp = this.hp;

    super.hp = value;

    if(oldHp !== this.hp) {
      EventBus.emit(MathZeldaEvent.PlayerHpChanged);
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
      EventBus.emit(MathZeldaEvent.PlayerDied);
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
    const weaponIdx = WeaponConfig.names.indexOf(this.currentWeapon);
    const itemIdx = ITEM_CONFIG.names.indexOf(this.currentItem);
    return (weaponIdx * 10) + itemIdx;
  }
}

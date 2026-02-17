import { ActorModel, Direction, IActorState, IdleState, KnockbackState } from './ActorModel.js';
import { RoomModel } from './RoomModel.js';
import { ITEM_CONFIG, WEAPON_CONFIG } from '../config.js';
import { ISceneWithItemDrops } from './EntityModel.js';
import { MathZeldaEvent } from '../Event.js';
import { EntitySubtype, EntityType, ValidSubtype } from '../EntityType.js';

export class AttackState implements IActorState {
  private timer: number;
  constructor(duration: number) {
    this.timer = Date.now() + duration;
  }
  enter(actor: ActorModel) { }
  update(actor: ActorModel, room: RoomModel, inputDir: Direction | null) {
    if (Date.now() > this.timer) {
      actor.changeState(new IdleState());
    }
  }
  getAnimKey(actor: ActorModel) {
    return `${actor.getEntityId()}_attack`;
  }
}

export class PlayerModel extends ActorModel {
  public inputDir: Direction | null = null;
  public weapons: string[] = [];
  public items: string[] = [];
  public currentWeapon: string;
  public currentItem: string;

  constructor(scene: ISceneWithItemDrops, config: { x: number, y: number, subtype: ValidSubtype<EntityType.PLAYER> }) {
    super(scene, {
      x: config.x,
      y: config.y,
      type: EntityType.PLAYER,
      subtype: config.subtype,
      currentHp: 6,
      maxHp: 6,
      speed: .5
    });

    this.weapons = [WEAPON_CONFIG.names[0]];
    this.items = [...ITEM_CONFIG.names];
    this.currentWeapon = this.weapons[0];
    this.currentItem = this.items[0];
  }

  public get hp(): number {
    return super.hp;
  }

  protected set hp(value: number) {
    const oldHp = this.hp;

    super.hp = value;

    if(oldHp !== this.hp) {
      this.scene.events.emit(MathZeldaEvent.PLAYER_HP_CHANGED, { hp: this.hp, player: this });
    }
  }

  ai(room: RoomModel): void {
    this.process(this.inputDir, room);
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    if (super.takeDamage(amount, srcX, srcY)) {
      this.scene.events.emit(MathZeldaEvent.PLAYER_DIED);
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

  attack(duration: number): void {
    if (this.state instanceof AttackState) return;
    if (this.state instanceof KnockbackState) return;
    this.changeState(new AttackState(duration));
  }

  getAttackValue(): number {
    const weaponIdx = WEAPON_CONFIG.names.indexOf(this.currentWeapon);
    const itemIdx = ITEM_CONFIG.names.indexOf(this.currentItem);
    return (weaponIdx * 10) + itemIdx;
  }
}
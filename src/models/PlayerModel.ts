import { ActorModel, Direction, IActorState, IdleState, KnockbackState } from './ActorModel.js';
import { RoomModel } from './RoomModel.js';
import { ITEM_CONFIG, WEAPON_CONFIG } from '../config.js';

export class AttackState implements IActorState {
  private timer: number;
  constructor(duration: number) {
    this.timer = Date.now() + duration;
  }
  enter(actor: ActorModel) {}
  update(actor: ActorModel, room: RoomModel, inputDir: Direction | null) {
    if (Date.now() > this.timer) {
      actor.changeState(new IdleState());
    }
  }
  getAnimKey(actor: ActorModel) {
    return `${actor.type}_atk_${actor.currentDir}`;
  }
}

export class PlayerModel extends ActorModel {
  subtype: string;
  public inputDir: Direction | null = null;  
  public weapons: string[] = [];
  public items: string[] = [];
  public currentWeapon: string;
  public currentItem: string;

  constructor(x: number, y: number) {
    super(x, y, 6, .5); // HP: 6, Speed: 2
    this.type = 'player';
    this.subtype = "player";
    this.weapons = ['Rapier'];
    this.items = [...ITEM_CONFIG.names];
    this.currentWeapon = this.weapons[0];
    this.currentItem = this.items[0];
  }

  ai(room: RoomModel): void {
    this.process(this.inputDir, room);
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

  getAnimKey(): string {
    if (this.isAttacking) return `${this.type}_atk_${this.currentDir}`;
    return super.getAnimKey();
  }

  getAttackValue(): number {
    const weaponIdx = WEAPON_CONFIG.names.indexOf(this.currentWeapon);
    const itemIdx = ITEM_CONFIG.names.indexOf(this.currentItem);
    return (weaponIdx * 10) + itemIdx;
  }
}
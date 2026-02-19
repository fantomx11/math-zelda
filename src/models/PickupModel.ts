import { PlayerModel } from './PlayerModel.js';
import { EntityConfig, EntityModel } from './EntityModel.js';

 /** Represents an item on the ground that can be picked up.
 */
export class PickupModel extends EntityModel {
  pickedUp: boolean = false;

  constructor(scene: SceneWithItemDrops, config: EntityConfig) {
    super(scene, config);
    this.subtype = config.subtype as any;
  }

  public get isBlocking(): boolean {
    return false;
  }


  /**
   * Pickups don't have AI.
   */
  tick(): boolean {
    return this.pickedUp;
  }

  /**
   * Pickups cannot take damage from attacks.
   */
  takeDamage(amount: number, srcX: number, srcY: number): boolean {
    return false;
  }

  getAnimKey(): string {
    return `item_${this.subtype}`;
  }

  /**
   * Called when a player collides with this pickup.
   * The base implementation does nothing and can be overridden by subclasses.
   * @param player The player model that collected this pickup.
   * @returns True if the pickup was successfully collected, false otherwise.
   */
  onPickup(player: PlayerModel): boolean {
    return true;
  }

  onTouch(other: EntityModel): void {
    if (other.type === 'player' && this.onPickup(other as PlayerModel)) {
      this.pickedUp = true;
    };
  }
}
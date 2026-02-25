import { PlayerModel } from './PlayerModel.js';
import { EntityConfig, EntityModel } from './EntityModel.js';
import { ValidSubtype } from '../Util.js';
import { EntitySubtype, EntityType } from '../Enums.js';

export type PickupConfig = {
  subtype: ValidSubtype<typeof EntityType.Pickup>;
} & EntityConfig;

export abstract class PickupModel extends EntityModel {
  pickedUp: boolean = false;

  constructor(config: PickupConfig) {
    super(config);
  }

  public get isBlocking(): boolean {
    return false;
  }

  /**
   * Pickups don't have AI.
   */
  tick(): boolean {
    return !this.pickedUp;
  }

  /**
   * Called when a player collides with this pickup.
   * The base implementation does nothing and can be overridden by subclasses.
   * @param player The player model that collected this pickup.
   * @returns True if the pickup was successfully collected, false otherwise.
   */
  abstract onPickup(player: PlayerModel): boolean;
  
  onTouch(other: EntityModel): void {
    if (other.type === EntityType.Player && this.onPickup(other as PlayerModel)) {
      this.pickedUp = true;
    };
  }
}
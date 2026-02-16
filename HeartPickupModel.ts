import { ISceneWithItemDrops } from './EntityModel.js';
import { PickupModel } from './PickupModel.js';
import { PlayerModel } from './PlayerModel.js';

/**
 * Represents a heart pickup that restores player health.
 */
export class HeartPickupModel extends PickupModel {
  constructor(x: number, y: number, scene: ISceneWithItemDrops) {
    super(x, y, 'heart', scene);
  }

  /**
   * Called when a player collides with this pickup.
   * Restores 1 heart (2 hp) to the player if they are not at max health.
   * @param player The player model that collected this pickup.
   * @returns True if the heart was collected, false if player is at max health.
   */
  onPickup(player: PlayerModel): boolean {
    return player.heal(2);
  }

}

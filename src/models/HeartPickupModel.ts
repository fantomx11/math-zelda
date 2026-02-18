import { SceneWithItemDrops } from './EntityModel.js';
import { PickupModel } from './PickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { EntityType } from '../EntityType.js';

/**
 * Represents a heart pickup that restores player health.
 */
export class HeartPickupModel extends PickupModel {
  private lifespan: number = 300; // ~5 seconds at 60fps

  constructor(scene: SceneWithItemDrops, config: { x: number, y: number }) {
    super(scene, { x: config.x, y: config.y, type: 'pickup' as EntityType, subtype: 'heart' });
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

  /**
   * Updates the heart's lifespan.
   * @returns True if the heart should be removed (picked up or expired).
   */
  tick(): boolean {
    if (this.pickedUp) return false;
    
    this.lifespan--;

    return this.lifespan > 0;
  }

  public get alpha(): number {
    // Start flickering when less than 2 seconds (120 frames) remain
    if (this.lifespan < 120) {
      return 0.5;
    }
    return 1;
  }
}

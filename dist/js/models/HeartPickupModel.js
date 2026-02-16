import { PickupModel } from './PickupModel.js';
/**
 * Represents a heart pickup that restores player health.
 */
export class HeartPickupModel extends PickupModel {
    constructor(x, y) {
        super(x, y, 'heart');
    }
    /**
     * Called when a player collides with this pickup.
     * Restores 1 heart (2 hp) to the player if they are not at max health.
     * @param player The player model that collected this pickup.
     * @returns True if the heart was collected, false if player is at max health.
     */
    onPickup(player) {
        const maxHp = 6; // Assuming max HP is 6 for now.
        if (player.hp < maxHp) {
            player.hp = Math.min(maxHp, player.hp + 2);
            this.hp = 0; // "Kill" the pickup so it gets removed
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=HeartPickupModel.js.map
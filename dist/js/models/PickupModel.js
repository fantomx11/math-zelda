import { ActorModel } from './ActorModel.js';
/** Represents an item on the ground that can be picked up.
*/
export class PickupModel extends ActorModel {
    constructor(x, y, pickupType) {
        super(x, y);
        this.type = 'pickup';
        this.subtype = pickupType;
        this.hp = 1; // It's "killed" when picked up.
    }
    /**
     * Pickups don't have AI.
     */
    ai(room) {
        // No-op
    }
    /**
     * Pickups cannot take damage from attacks.
     */
    takeDamage(amount, srcX, srcY) {
        return false;
    }
    getAnimKey() {
        return `item_${this.subtype}`;
    }
    /**
     * Called when a player collides with this pickup.
     * The base implementation does nothing and can be overridden by subclasses.
     * @param player The player model that collected this pickup.
     * @returns True if the pickup was successfully collected, false otherwise.
     */
    onPickup(player) {
        return true;
    }
    onTouch(other) {
        if (other.type === 'player')
            this.onPickup(other);
    }
}
//# sourceMappingURL=PickupModel.js.map
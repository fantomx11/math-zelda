import { PickupModel } from './PickupModel.js';
export class WeaponPickupModel extends PickupModel {
    constructor(x, y, weaponName) {
        super(x, y, weaponName);
    }
    getAnimKey() {
        return `weapon_${this.subtype}`;
    }
    onPickup(player) {
        if (!player.weapons.includes(this.subtype)) {
            player.weapons.push(this.subtype);
            if (this.onCollect)
                this.onCollect();
            this.hp = 0; // Destroy
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=WeaponPickupModel.js.map
import { PickupModel } from './PickupModel.js';
import { PlayerModel } from './PlayerModel.js';

export class WeaponPickupModel extends PickupModel {
  public onCollect?: () => void;

  constructor(x: number, y: number, weaponName: string) {
    super(x, y, weaponName);
  }

  getAnimKey(): string {
    return `weapon_${this.subtype}`;
  }

  onPickup(player: PlayerModel): boolean {
    if (!player.weapons.includes(this.subtype)) {
      player.weapons.push(this.subtype);
      if (this.onCollect) this.onCollect();
      this.hp = 0; // Destroy
      return true;
    }
    return false;
  }
}
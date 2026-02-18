import { PickupModel } from './PickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { EntityType } from '../EntityType.js';
import { SceneWithItemDrops } from './EntityModel.js';

export class WeaponPickupModel extends PickupModel {
  public onCollect?: () => void;

  constructor(scene: SceneWithItemDrops, config: { x: number, y: number, subtype: string }) {
    super(scene, { x: config.x, y: config.y, type: 'pickup' as EntityType, subtype: config.subtype });
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
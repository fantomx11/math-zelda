import { EntitySubtype } from '../Enums.js';
import { gameState } from '../GameState.js';
import { PickupConfig, PickupModel } from './PickupModel.js';
import { PlayerModel } from './PlayerModel.js';

type WeaponConfig = {
  subtype: never;
} & PickupConfig;



export class WeaponPickupModel extends PickupModel {
  constructor(config: WeaponConfig) {
    super({ ...config, subtype: EntitySubtype.Weapon });
  }

  onPickup(player: PlayerModel): boolean {
    gameState.findItem();
    return true;
  }
}
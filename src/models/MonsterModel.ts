import { ActorModel, Direction, KnockbackState, MoveState } from './ActorModel.js';
import { EntityConfig, EntityModel, ISceneWithItemDrops } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { RoomModel } from './RoomModel.js';
import { MathZeldaEvent } from '../Event.js';

/**
 * Base class for enemies with basic AI.
 */
export class MonsterModel extends ActorModel {
  public static DAMAGE_AMOUNT: number = 1;
  public aiTimer: number;
  public mathProblem: { a: number, b: number, answer: number };

  constructor(x: number, y: number, type: string, subtype: string, scene: ISceneWithItemDrops, config?: EntityConfig) {
    super(x, y, type, subtype, scene, config);
    this.hp = 3;
    this.aiTimer = 0;
    this.mathProblem = { a: 0, b: 0, answer: 0 };
  }

  /**
   * Executes AI logic for movement.
   * @param room The room model.
   */
  ai(room: RoomModel): void {
    if (this.state instanceof KnockbackState) {
      this.process(null, room);
      return;
    }

    // If currently moving, continue that movement
    if (this.state instanceof MoveState) {
      this.process(null, room);
      return;
    }

    // If waiting, count down
    if (this.aiTimer > 0) {
      this.aiTimer--;
      return;
    }

    // Pick a random direction
    const dirs: Direction[] = [Direction.up, Direction.down, Direction.left, Direction.right];
    const pick = dirs[Math.floor(Math.random() * dirs.length)];
    this.process(pick, room);

    // Set a pause timer
    if (!(this.state instanceof MoveState)) this.aiTimer = 30 + Math.floor(Math.random() * 30);
  }

  /**
   * Handles monster-specific death logic, like dropping items.
   * @param scene The scene context.
   */
  onDeath(scene: ISceneWithItemDrops): void {
    scene.events.emit(MathZeldaEvent.MONSTER_DIED, { monster: this });
    if (Math.random() < 0.25) {
      scene.spawnPickup(new HeartPickupModel(this.x, this.y, scene));
    }
  }

  onTouch(other: EntityModel): void {
    if (other.type === 'player') {
      (other as PlayerModel).takeDamage(MonsterModel.DAMAGE_AMOUNT, this.x, this.y);
    }
  }

  getIdleAnimKey(): string {
    return `${this.subtype}_${this.currentDir}_idle`;
  }

}

import { ActorConfig, ActorModel, ActorSpecificConfig, Direction, IActorState, KnockbackState, MoveState } from './ActorModel.js';
import { DefaultConfig, EntityModel, ISceneWithItemDrops } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { RoomModel } from './RoomModel.js';
import { MathZeldaEvent } from '../Event.js';
import { EntitySubtype, EntityType, ValidSubtype } from '../EntityType.js';


/**
 * Configuration for Monster initialization.
 */

type EnemySpecificConfig = ({
  level: number;
  mathProblem?: never;
} | {
  level?: never;
  mathProblem: { a: number, b: number, answer: number };
}) & {
  color: string
};

export type EnemyConfig = ActorConfig & EnemySpecificConfig;

const ENEMY_DEFAULTS: { [key in ValidSubtype<EntityType.ENEMY>]?: DefaultConfig<ActorSpecificConfig> } = {
  [EntitySubtype.MOBLIN]: { currentHp: 2, speed: .25 }
};

/**
 * Base class for enemies with basic AI.
 */
export class EnemyModel extends ActorModel {
  public static DAMAGE_AMOUNT: number = 1;
  public aiTimer: number;
  public mathProblem: { a: number, b: number, answer: number };
  public color: string;

  constructor(scene: ISceneWithItemDrops, config: EnemyConfig) {
    super(scene, config);

    const {color, level, mathProblem } = config;

    this.aiTimer = 0;
    if (mathProblem) {
      this.mathProblem = mathProblem;
    } else {
      let b = Math.floor(Math.random() * 10);

      this.mathProblem = { a: level, b: b, answer: level * b };
    }
    this.color = color;
  }

  public get baseAnimKey() {
    return `${EntityType.ENEMY}_${this.subtype}_${this.color}`;
  }

  public changeState(newState: IActorState): void {

    if (newState instanceof MoveState) {
      this.rest();
    } else {
      this.aiTimer = 0;
    }

    super.changeState(newState);
  }

  private rest() {
    this.aiTimer = 30 + Math.floor(Math.random() * 30);
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
  }

  /**
   * Handles monster-specific death logic, like dropping items.
   * @param scene The scene context.
   */
  onDeath(scene: ISceneWithItemDrops): void {
    scene.events.emit(MathZeldaEvent.MONSTER_DIED, { monster: this });
    if (Math.random() < 0.25) {
      scene.spawnPickup(new HeartPickupModel(scene, { x: this.x, y: this.y }));
    }
  }

  onTouch(other: EntityModel): void {
    if (other.type === 'player') {
      (other as PlayerModel).takeDamage(EnemyModel.DAMAGE_AMOUNT, this.x, this.y);
    }
  }

}

import { ActorConfig, ActorModel, Direction, IActorState, KnockbackState, MoveState } from './ActorModel.js';
import { EntityModel, ISceneWithItemDrops } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { RoomModel } from './RoomModel.js';
import { MathZeldaEvent } from '../Event.js';
import { EntitySubtype, EntityType, ValidSubtype } from '../EntityType.js';


/**
 * Configuration for Monster initialization.
 */
export type EnemyConfig = ActorConfig & { color?: string } & ({
  level: number;
  mathProblem?: never;
} | {
  level?: never;
  mathProblem: { a: number, b: number, answer: number };
});

const ENEMY_DEFAULTS: { [key in ValidSubtype<EntityType.ENEMY>]?: Partial<ActorConfig> } = {
  [EntitySubtype.MOBLIN]: { currentHp: 2, speed: .25 }
};

/**
 * Base class for enemies with basic AI.
 */
export class EnemyModel extends ActorModel {
  static createMoblin(x: number, y: number, scene: ISceneWithItemDrops, palette: string = '', config: { level: number } | { mathProblem: { a: number, b: number, answer: number } }): EnemyModel {
    return new EnemyModel(scene, {
      x,
      y,
      type: EntityType.ENEMY,
      subtype: EntitySubtype.MOBLIN,
      color: palette,
      ...ENEMY_DEFAULTS[EntitySubtype.MOBLIN],
      ...config
    } as EnemyConfig);
  }

  public static DAMAGE_AMOUNT: number = 1;
  public aiTimer: number;
  public mathProblem: { a: number, b: number, answer: number };
  public color: string;

  constructor(scene: ISceneWithItemDrops, config: EnemyConfig) {
    super(scene, config);
    this.hp = 3;
    this.aiTimer = 0;
    if (config.mathProblem) {
      this.mathProblem = config.mathProblem;
    } else {
      // TODO: Implement logic to generate a math problem based on level.
      // For now, using a placeholder.
      this.mathProblem = { a: config.level, b: 1, answer: config.level };
    }
    this.color = config.color || '';
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

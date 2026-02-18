import { ActorConfig, ActorModel, ActorSpecificConfig, Direction, ActorState, IdleState, MoveState, KnockbackState } from './ActorModel.js';
import { DefaultConfig, EntityModel, SceneWithItemDrops } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { RoomModel } from './RoomModel.js';
import { MathZeldaEvent } from '../Event.js';
import { EntitySubtype, EntityType, ValidSubtype } from '../EntityType.js';
import { ActionType } from '../actions/ActorAction.js';


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

/**
 * Base class for enemies with basic AI.
 */
export class EnemyModel extends ActorModel {
  public static DAMAGE_AMOUNT: number = 1;
  public aiTimer: number;
  public mathProblem: { a: number, b: number, answer: number };
  public color: string;

  constructor(scene: SceneWithItemDrops, config: EnemyConfig) {
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


  /**
   * Executes AI logic for movement.
   * @param room The room model.
   */
  ai(room: RoomModel): void {
    if (this.nextAction()) return; // Already has action

    if (this.state === KnockbackState) return;

    // If waiting, count down
    if (this.aiTimer > 0) {
      this.aiTimer--;
      return;
    }

    // Pick a random direction
    const dirs: Direction[] = [Direction.up, Direction.down, Direction.left, Direction.right];
    const pick = dirs[Math.floor(Math.random() * dirs.length)];
    
    // Calculate target based on grid size (32)
    let tx = this.x;
    let ty = this.y;
    const dist = 32;
    
    if (pick === Direction.left) tx -= dist;
    else if (pick === Direction.right) tx += dist;
    else if (pick === Direction.up) ty -= dist;
    else if (pick === Direction.down) ty += dist;

    // Queue the move action
    this.queueAction({
      type: ActionType.MOVE,
      data: { x: tx, y: ty }
    });

    // Rest after moving
    this.aiTimer = 60 + Math.floor(Math.random() * 30);
  }

  /**
   * Handles monster-specific death logic, like dropping items.
   * @param scene The scene context.
   */
  onDeath(scene: SceneWithItemDrops): void {
    scene.events.emit(MathZeldaEvent.EntityCulled, { monster: this });
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

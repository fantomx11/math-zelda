import { ActorConfig, ActorModel, ActorSpecificConfig, Direction, ActorState, IdleState, MoveState, KnockbackState } from './ActorModel.js';
import { EntityModel } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { RoomModel } from './RoomModel.js';
import { MathZeldaEvent } from '../Event.js';
import { ActionType } from '../actions/ActorAction.js';
import { EntityType } from '../Enums.js';
import { EventBus } from '../EventBus.js';
import { gameState } from '../GameState.js';


/**
 * Configuration for Monster initialization.
 */

type EnemyOptionalConfig = { }

type EnemyRequiredConfig = {
  color: string
};

type EnemySpecificConfig = EnemyOptionalConfig & EnemyRequiredConfig;

export type EnemyConfig = ActorConfig & EnemySpecificConfig;

/**
 * Base class for enemies with basic AI.
 */
export class EnemyModel extends ActorModel {
  public static DamageAmount: number = 1;
  public aiTimer: number;
  public color: string;

  constructor(config: EnemyConfig) {
    super(config);

    const { color } = config;

    this.aiTimer = 0;
    this.color = color;
  }


  /**
   * Executes AI logic for movement.
   * @param room The room model.
   */
  ai(): void {
    if (this.nextAction()) return; // Already has action

    if (this.state === KnockbackState) return;
    
    // Calculate target based on grid size (32)
    let tx = Math.floor(Math.random() * 192 / 8) * 8;
    let ty = Math.floor(Math.random() * 192 / 8) * 8;;
    
    // Queue the move action
    this.queueAction({
      type: ActionType.MOVE,
      data: { x: tx, y: ty }
    });

    this.queueAction({
      type: ActionType.WAIT,
      data: { duration: 60 + Math.floor(Math.random() * 30) }
    });
  }

  /**
   * Handles monster-specific death logic, like dropping items.
   * @param scene The scene context.
   */
  onDeath(): void {
    EventBus.emit(MathZeldaEvent.MonsterDied, { monster: this });
    if (Math.random() < 0.25) {
      gameState.spawnEntity(new HeartPickupModel({ x: this.x, y: this.y }));
    }
  }

  onTouch(other: EntityModel): void {
    if (other.type === 'player') {
      (other as PlayerModel).takeDamage(EnemyModel.DamageAmount, this.x, this.y);
    }
  }

}

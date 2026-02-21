import { ActorConfig, ActorModel, ActorSpecificConfig, Direction, ActorState, IdleState, MoveState, KnockbackState } from './ActorModel.js';
import { EntityModel } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { MathZeldaEvent } from '../Event.js';
import { ActionType } from '../actions/ActorAction.js';
import { EventBus } from '../EventBus.js';
import { gameState } from '../GameState.js';


// --- AI Behavior Definitions ---

export type AiBehavior = (enemy: EnemyModel) => void;

export const randomMovementAI: AiBehavior = (enemy: EnemyModel) => {
  const room = gameState.currentRoom;
  const playableSize = 192;
  const wallSize = 32;
  const gridSize = room.gridSize;

  const tx = wallSize + Math.floor(Math.random() * (playableSize / gridSize)) * gridSize;
  const ty = wallSize + Math.floor(Math.random() * (playableSize / gridSize)) * gridSize;
  
  enemy.queueAction({
    type: ActionType.MOVE,
    data: { x: tx, y: ty }
  });

  enemy.queueAction({
    type: ActionType.WAIT,
    data: { duration: 60 + Math.floor(Math.random() * 30) }
  });
};

export const chasePlayerAI: AiBehavior = (enemy: EnemyModel) => {
  const player = gameState.player;
  const room = gameState.currentRoom;
  const gridSize = room.gridSize;
  
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  if (Math.abs(dx) < gridSize && Math.abs(dy) < gridSize) {
    enemy.queueAction({ type: ActionType.WAIT, data: { duration: 30 } });
    return;
  }

  const candidates: Direction[] = [];
  if (Math.abs(dx) >= Math.abs(dy)) {
    candidates.push(dx > 0 ? Direction.right : Direction.left);
    candidates.push(dy > 0 ? Direction.down : Direction.up);
  } else {
    candidates.push(dy > 0 ? Direction.down : Direction.up);
    candidates.push(dx > 0 ? Direction.right : Direction.left);
  }
  
  for (const dir of candidates) {
    const tx = enemy.x + (dir === Direction.left ? -gridSize : dir === Direction.right ? gridSize : 0);
    const ty = enemy.y + (dir === Direction.up ? -gridSize : dir === Direction.down ? gridSize : 0);

    if (room.isPassable(tx, ty, false)) {
      enemy.queueAction({ type: ActionType.MOVE, data: { x: tx, y: ty } });
      return;
    }
  }

  enemy.queueAction({ type: ActionType.WAIT, data: { duration: 30 } });
};


/**
 * Configuration for Monster initialization.
 */

type EnemyOptionalConfig = {
  aiBehavior?: AiBehavior;
}

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
  private aiBehavior: AiBehavior;

  constructor(config: EnemyConfig) {
    super(config);

    const { color, aiBehavior = randomMovementAI } = config;

    this.aiTimer = 0;
    this.color = color;
    this.aiBehavior = aiBehavior;
  }


  /**
   * Executes AI logic for movement.
   * @param room The room model.
   */
  ai(): void {
    // An action is already queued or being processed, do nothing until it's done.
    if (this.nextAction()) {
      // If we have a move action but are idle, transition to MoveState.
      if (this.state === IdleState && this.nextAction()?.type === ActionType.MOVE) {
        this.changeState(MoveState);
      }
      return;
    }

    // Don't decide a new action if being knocked back.
    if (this.state === KnockbackState) return;
    
    // Delegate action decision to the assigned AI behavior.
    this.aiBehavior(this);
  }

  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    if(gameState.currentRoom.mathProblem.answer === gameState.player.currentAttackValue) {
      return super.takeDamage(amount, srcX, srcY);
    } else {
      return false;
    }
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

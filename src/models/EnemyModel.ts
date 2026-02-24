import { ActorConfig, ActorModel, IdleState, MoveState, KnockbackState } from './ActorModel.js';
import { Direction } from '../Enums.js';
import { EntityModel } from './EntityModel.js';
import { HeartPickupModel } from './HeartPickupModel.js';
import { PlayerModel } from './PlayerModel.js';
import { MathZeldaEvent } from '../Event.js';
import { ActionType } from '../Enums.js';
import { EventBus } from '../EventBus.js';
import { gameState } from '../GameState.js';

//#region AI Behaviors
export const randomMovementAI: AiBehavior = (enemy: ActorModel) => {
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

export const chasePlayerAI: AiBehavior = (enemy: ActorModel) => {
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

    if (room.isPassable(tx, ty, false, [enemy])) {
      enemy.queueAction({ type: ActionType.MOVE, data: { x: tx, y: ty } });
      return;
    }
  }

  enemy.queueAction({ type: ActionType.WAIT, data: { duration: 30 } });
};
//#endregion

export type AiBehavior = (actor: ActorModel) => void;

//#region Config
type EnemyOptionalConfig = {
  damageAmount: number;
}

type EnemyRequiredConfig = {
  color: string;
  aiBehavior: AiBehavior;
};

type EnemySpecificConfig = EnemyOptionalConfig & EnemyRequiredConfig;

export type EnemyConfig = ActorConfig & EnemySpecificConfig;
//#endregion

const defaultConfig: Required<EnemyOptionalConfig> & Partial<EnemyConfig> = {
  aiBehavior: randomMovementAI,
  states: [IdleState, MoveState, KnockbackState],
  color: "red",
  damageAmount: 1
}

export class EnemyModel extends ActorModel {
  constructor(config: EnemyConfig) {
    // Enemies use a standard set of states.
    super({
      ...config,
      ...defaultConfig
    });

    const { color, damageAmount, aiBehavior } = { ...config, ...defaultConfig };

    this.damageAmount = damageAmount;
    this.color = color;
    this.aiBehavior = aiBehavior;
  }

  //#region Identity
  public color: string;

  public get entityId(): string {
    return `${this.color}_${this.subtype}_${this.currentDir}`;
  }
  //#endregion

  //#region Logic
  private aiBehavior: AiBehavior;

  ai(): void {
    this.aiBehavior(this);
  }
  //#endregion

  //#region Health
  public takeDamage(amount: number, srcX: number, srcY: number): boolean {
    if (gameState.currentRoom.mathProblem.answer === gameState.player.currentAttackValue) {
      return super.takeDamage(amount, srcX, srcY);
    } else {
      return false;
    }
  }
  //#endregion

  //#region Interaction
  public damageAmount: number;

  onDeath(): void {
    EventBus.emit(MathZeldaEvent.ActorDied, { actor: this });
    if (Math.random() < 0.25) {
      gameState.spawnEntity(new HeartPickupModel({ x: this.x, y: this.y }));
    }
    super.onDeath();
  }

  onTouch(other: EntityModel): void {
    if (other.type === 'player') {
      (other as PlayerModel).takeDamage(this.damageAmount, this.x, this.y);
    }
  }
  //#endregion
}

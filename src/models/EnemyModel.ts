import { ActorConfig, ActorModel } from './ActorModel.js';
import { KnockbackState } from '../state/KnockbackState.js';
import { MoveState } from '../state/MoveState.js';
import { IdleState } from '../state/IdleState.js';
import { EntityModel } from './EntityModel.js';
import { PlayerModel } from './PlayerModel.js';
import { gameState } from '../GameState.js';
import { randomMovementAI } from '../ai/randomMovementAI.js';
import { AiBehavior } from '../ai/AiBehavior.js';

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

  onTouch(other: EntityModel): void {
    if (other.type === 'player') {
      (other as PlayerModel).takeDamage(this.damageAmount, this.x, this.y);
    }
  }
  //#endregion
}

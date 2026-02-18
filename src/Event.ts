import { MathZeldaEvent } from "./Enums";
import { ActorModel } from "./models/ActorModel";
import { EnemyModel } from "./models/EnemyModel";
import { EntityModel } from "./models/EntityModel";
import { PickupModel } from "./models/PickupModel";

export interface ActorHpChangedPayload {
  hp: number;
  actor: ActorModel;
}

export interface ActorHurtPayload {
  amount: number;
  actor: ActorModel;
}

export interface ActorAttackPayload {
  actor: ActorModel;
}

export interface PickupCollectedPayload {
  pickup: PickupModel;
}

export interface MonsterDiedPayload {
  monster: EnemyModel;
}

export interface EntityCulledPayload {
  entity: EntityModel;
} 

export type EventPayloads = {
  [MathZeldaEvent.GamePaused]: void;
  [MathZeldaEvent.GameResumed]: void;
  [MathZeldaEvent.RoomChanged]: void;
  [MathZeldaEvent.LevelChanged]: void;

  [MathZeldaEvent.PlayerHpChanged]: void;
  [MathZeldaEvent.PlayerDied]: void;

  [MathZeldaEvent.BossDied]: void;

  [MathZeldaEvent.ActorHurt]: ActorHurtPayload;
  [MathZeldaEvent.ActorHpChanged]: ActorHpChangedPayload;
  [MathZeldaEvent.ActorAttack]: ActorAttackPayload;
  [MathZeldaEvent.EntityCulled]: EntityCulledPayload;
  [MathZeldaEvent.MonsterDied]: MonsterDiedPayload;
  [MathZeldaEvent.PickupCollected]: PickupCollectedPayload;
};

export { MathZeldaEvent };

import { ActorModel } from "./models/ActorModel";
import { EnemyModel } from "./models/EnemyModel";
import { EntityModel } from "./models/EntityModel";
import { PickupModel } from "./models/PickupModel";

export enum MathZeldaEvent {
  GAME_PAUSED = "game_paused",
  GAME_RESUMED = "game_resumed",
  ROOM_CHANGED = "room_changed",
  
  PLAYER_HP_CHANGED = "player_hp_changed",
  PLAYER_DIED = "player_died",
  
  ACTOR_HURT = "actor_hurt",
  ACTOR_HP_CHANGED = "actor_hp_changed",
  ACTOR_ATTACK = "actor_attack",
  ENTITY_CULLED = "entity_culled",
  MONSTER_DIED = "monster_died",
  PICKUP_COLLECTED = "pickup_collected"
}

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
  [MathZeldaEvent.GAME_PAUSED]: void;
  [MathZeldaEvent.GAME_RESUMED]: void;
  [MathZeldaEvent.ROOM_CHANGED]: void;

  [MathZeldaEvent.PLAYER_HP_CHANGED]: void;
  [MathZeldaEvent.PLAYER_DIED]: never;

  [MathZeldaEvent.ACTOR_HURT]: ActorHurtPayload;
  [MathZeldaEvent.ACTOR_HP_CHANGED]: ActorHpChangedPayload;
  [MathZeldaEvent.ACTOR_ATTACK]: ActorAttackPayload;
  [MathZeldaEvent.ENTITY_CULLED]: EntityCulledPayload;
  [MathZeldaEvent.MONSTER_DIED]: MonsterDiedPayload;
  [MathZeldaEvent.PICKUP_COLLECTED]: PickupCollectedPayload;
};
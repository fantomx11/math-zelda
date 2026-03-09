import { MathZeldaEvent } from "./Enums";
import { ActorModel } from "./models/ActorModel";
import { EntityModel } from "./models/EntityModel";
import { PickupModel } from "./models/PickupModel";

export interface AmountPayload {
  amount: number;
}

export interface PickupPayload {
  pickup: PickupModel;
}

export interface ActorPayload {
  actor: ActorModel;
}

interface EntityPayload {
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

  [MathZeldaEvent.EntitySpawned]: EntityPayload;
  [MathZeldaEvent.EntityCulled]: EntityPayload;

  [MathZeldaEvent.ActorHurt]: ActorPayload;
  [MathZeldaEvent.ActorHpChanged]: ActorPayload;
  [MathZeldaEvent.ActorMoved]: ActorPayload;
  [MathZeldaEvent.ActorAttack]: ActorPayload;
  [MathZeldaEvent.ActorDied]: ActorPayload;

  [MathZeldaEvent.PickupCollected]: PickupPayload;
};

export { MathZeldaEvent };

// src/actions/ActorActions.ts
import { ActorModel, Direction } from '../models/ActorModel';
import { RoomModel } from '../models/RoomModel';
import { Direction } from '../models/ActorModel';

export enum ActionType {
  MOVE,
  ATTACK,
  WAIT
}

/**
 * Define specific data structures for each logical intent.
 */
export interface MoveActionData {
  x: number;
  y: number;
}

export interface AttackActionData {
  direction: Direction;
}

export interface WaitActionData {
  duration: number;
}

// 2. The Map: Connect the Enum to the Interface
export interface ActionDataMap {
  [ActionType.MOVE]: MoveActionData;
  [ActionType.ATTACK]: AttackActionData;
  [ActionType.WAIT]: WaitActionData;
}

/**
 * Use a Discriminated Union to bind Type to Data.
 */
export type QueuedAction = {
  [K in ActionType]: { type: K; data: ActionDataMap[K] };
}[ActionType];

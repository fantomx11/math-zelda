import { ActorStateType } from '../Enums';
import { ActorModel } from '../models/ActorModel';
import { ActorState } from './ActorState';

export const PlayerAttackState: ActorState = {
  type: ActorStateType.ATTACK,
  enter: (actor: ActorModel) => {
    const ATTACK_DURATION = 250; // ms
    actor.currentState.payload = { endTime: Date.now() + ATTACK_DURATION };
  },
  update: (actor: ActorModel) => {
    // Check if the attack duration has elapsed
    if (Date.now() >= actor.currentState.payload.endTime) {
      actor.finishState();
    }
  },
};

import { ActorStateType } from '../Enums';
import { ActorState } from './ActorState';
import { ActorModel } from '../models/ActorModel';

export const WaitState: ActorState = {
  type: ActorStateType.WAIT,
  enter(actor) {
    const payload = actor.currentState.payload;
    actor.currentState.payload = { end: Date.now() + payload.duration };
  },
  update(actor: ActorModel) {
    const { end } = actor.currentState.payload;

    if (Date.now() >= end) {
      actor.finishState();
    }
  }
};

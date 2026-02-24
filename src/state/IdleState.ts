import { ActorStateType } from '../Enums';
import { ActorState } from './ActorState';
import { ActorModel } from '../models/ActorModel';

export const IdleState: ActorState = {
  type: ActorStateType.IDLE,
  enter(actor: ActorModel) {
    actor.snapToGrid();
  },
  update(actor: ActorModel) {
    // No movement, just wait for input
  },
};

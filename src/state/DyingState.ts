import { ActorStateType } from '../Enums';
import { ActorState } from './ActorState';
import { ActorModel } from '../models/ActorModel';

export const DyingState: ActorState = {
  type: ActorStateType.DYING,
  enter(actor) {
    actor.clearStateQueue();
  },
  update(actor: ActorModel) {
  },
  exit(actor) {
  }
};

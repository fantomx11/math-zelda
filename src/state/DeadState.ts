import { ActorStateType, MathZeldaEvent, EntityType } from '../Enums';
import { EventBus } from '../EventBus';
import { gameState } from '../GameState';
import { ActorState } from './ActorState';
import { ActorModel } from '../models/ActorModel';
import { HeartPickupModel } from '../models/HeartPickupModel';

export const DeadState: ActorState = {
  type: ActorStateType.DEAD,
  enter(actor) {
    EventBus.emit(MathZeldaEvent.ActorDied, { actor: actor });
    if (actor.type === EntityType.Enemy) {
      if (Math.random() < 0.25) {
        gameState.spawnEntity(new HeartPickupModel({ x: this.x, y: this.y }));
      }
    }
  },
  update(actor: ActorModel) {
  },
  exit(actor) {
  }
};

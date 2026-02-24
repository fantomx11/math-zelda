import { ActorStateType, Direction, MoveReturnValue } from '../Enums';
import { ActorState } from './ActorState';
import { ActorModel } from '../models/ActorModel';

export const MoveState: ActorState = {
  type: ActorStateType.MOVE,
  directionFromXY: (dx: number, dy: number): Direction => {
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0 ? Direction.right : Direction.left;
    } else {
      return dy > 0 ? Direction.down : Direction.up;
    }
  },

  enter(actor: ActorModel) {
    const { x, y } = actor.currentState!.payload;

    const dx = x - actor.x;
    const dy = y - actor.y;

    actor.face(this.directionFromXY(dx, dy));
  },

  update(actor: ActorModel) {
    const { x, y } = actor.currentState.payload as any;
    const result = actor.walk();

    if (result === MoveReturnValue.Complete) {
      if (Math.abs(actor.x - x) < 1 && Math.abs(actor.y - y) < 1) {
        actor.snapToGrid();
        actor.finishState();
        return;
      }

      actor.currentState.payload.stepsTaken++;

      const dx = x - actor.x;
      const dy = y - actor.y;
      let changeDir = false;

      if (actor.currentState.payload.stepsTaken >= 2) {
        changeDir = true;
      } else if (actor.currentDir === Direction.right && dx <= 0) {
        changeDir = true;
      } else if (actor.currentDir === Direction.left && dx >= 0) {
        changeDir = true;
      } else if (actor.currentDir === Direction.down && dy <= 0) {
        changeDir = true;
      } else if (actor.currentDir === Direction.up && dy >= 0) {
        changeDir = true;
      }

      if (changeDir) {
        actor.currentState.payload.stepsTaken = 0;
        actor.face(this.directionFromXY(dx, dy));
      }
    } else if (result === MoveReturnValue.Blocked) {
      actor.snapToGrid();
      actor.currentState.payload.stepsTaken = 0;
      const dx = x - actor.x;
      const dy = y - actor.y;

      if (actor.currentDir === Direction.left || actor.currentDir === Direction.right) {
        if (dy !== 0) actor.face(dy > 0 ? Direction.down : Direction.up);
        else {
          actor.finishState();
        }
      } else {
        if (dx !== 0) actor.face(dx > 0 ? Direction.right : Direction.left);
        else {
          actor.finishState();
        }
      }
    }
  }
};

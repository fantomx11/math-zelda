import { ActorStateType, Direction, EntityType } from '../Enums';
import { gameState } from '../GameState';
import { ActorState } from './ActorState';
import { ActorModel } from '../models/ActorModel';

export const KnockbackState: ActorState = {
  type: ActorStateType.KNOCKBACK,
  enter(actor: ActorModel) {
    let dx = actor.currentState.payload.srcX - actor.x;
    let dy = actor.currentState.payload.srcY - actor.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        actor.face(Direction.right);
        dx = -2;
        dy = 0;
      } else {
        actor.face(Direction.left);
        dx = 2;
        dy = 0;
      }
    } else {
      if (dy > 0) {
        actor.face(Direction.down);
        dx = 0;
        dy = -2;
      } else {
        actor.face(Direction.up);
        dx = 0;
        dy = 2;
      }
    }
    const dist = 32;

    actor.currentState.payload = { dist, dx, dy };
  },

  update(actor: ActorModel) {
    const { dist, dx, dy } = actor.currentState.payload as any;

    if (dist < Math.abs(dx) || dist < Math.abs(dy)) {
      actor.snapToGrid();
      actor.finishState();
      return;
    }

    const nextX = actor.x + dx;
    const nextY = actor.y + dy;

    if (!gameState.currentRoom.isPassable(nextX, nextY, actor.type === EntityType.Player, [actor])) {
      actor.snapToGrid();
    } else {
      actor.setPosition(nextX, nextY);
    }

    actor.currentState.payload.dist -= Math.max(Math.abs(dx), Math.abs(dy));
  },
};

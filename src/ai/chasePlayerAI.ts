import { ActorStateType, Direction } from '../Enums';
import { gameState } from '../GameState';
import { ActorModel } from '../models/ActorModel';
import { AiBehavior } from './AiBehavior';

export const chasePlayerAI: AiBehavior = (enemy: ActorModel) => {
  const player = gameState.player;
  const room = gameState.currentRoom;
  const gridSize = room.gridSize;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  if (Math.abs(dx) < gridSize && Math.abs(dy) < gridSize) {
    enemy.queueState(ActorStateType.WAIT, { duration: 30 });
    return;
  }

  const candidates: Direction[] = [];
  if (Math.abs(dx) >= Math.abs(dy)) {
    candidates.push(dx > 0 ? Direction.right : Direction.left);
    candidates.push(dy > 0 ? Direction.down : Direction.up);
  } else {
    candidates.push(dy > 0 ? Direction.down : Direction.up);
    candidates.push(dx > 0 ? Direction.right : Direction.left);
  }

  for (const dir of candidates) {
    const tx = enemy.x + (dir === Direction.left ? -gridSize : dir === Direction.right ? gridSize : 0);
    const ty = enemy.y + (dir === Direction.up ? -gridSize : dir === Direction.down ? gridSize : 0);

    if (room.isPassable(tx, ty, false, [enemy])) {
      enemy.queueState(ActorStateType.MOVE, { x: tx, y: ty });
      return;
    }
  }

  enemy.queueState(ActorStateType.WAIT, { duration: 30 });
};

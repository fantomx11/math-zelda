import { ActorStateType } from '../Enums';
import { gameState } from '../GameState';
import { ActorModel } from '../models/ActorModel';
import { AiBehavior } from './AiBehavior';

export const randomMovementAI: AiBehavior = (enemy: ActorModel) => {
  const room = gameState.currentRoom;
  const playableSize = 192;
  const wallSize = 32;
  const gridSize = room.gridSize;

  const tx = wallSize + Math.floor(Math.random() * (playableSize / gridSize)) * gridSize;
  const ty = wallSize + Math.floor(Math.random() * (playableSize / gridSize)) * gridSize;

  enemy.queueState(ActorStateType.MOVE, { x: tx, y: ty });

  enemy.queueState(ActorStateType.WAIT, { duration: 60 + Math.floor(Math.random() * 30) });
};

import { DungeonScene } from '../scenes/DungeonScene.js';

export class GameMode {
  constructor(protected scene: DungeonScene) {}
  enter(): void {}
  exit(): void {}
  update(): void {}
  handleInput(event: KeyboardEvent): void {}
}
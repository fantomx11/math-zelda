import { GameMode } from './GameMode.js';
import { PauseMode } from './PauseMode.js';

export class DungeonMode extends GameMode {
  enter(): void {
    if (!this.scene.isGameStarted) {
      this.scene.startGame();
    }
  }

  update(): void {
    this.scene.updateGameLogic();
  }

  handleInput(event: KeyboardEvent): void {
    if (event.code === 'Escape') {
      this.scene.pushMode(new PauseMode(this.scene));
    } else if (event.code === 'Space') {
      this.scene.performAttack();
    }
  }
}
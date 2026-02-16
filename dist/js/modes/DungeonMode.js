import { GameMode } from './GameMode.js';
import { PauseMode } from './PauseMode.js';
export class DungeonMode extends GameMode {
    enter() {
        if (!this.scene.isGameStarted) {
            this.scene.startGame();
        }
    }
    update() {
        this.scene.updateGameLogic();
    }
    handleInput(event) {
        if (event.code === 'Escape') {
            this.scene.pushMode(new PauseMode(this.scene));
        }
        else if (event.code === 'Space') {
            this.scene.performAttack();
        }
    }
}
//# sourceMappingURL=DungeonMode.js.map
import { GameMode } from './GameMode.js';
import { DungeonMode } from './DungeonMode.js';
export class TitleMode extends GameMode {
    enter() {
        this.text = this.scene.add.bitmapText(160, 128, 'arcade', 'Math Zelda\n\nPress Space\n\nEsc - Pause\n\nEnter - Inventory').setOrigin(0.5).setCenterAlign();
    }
    exit() {
        if (this.text)
            this.text.destroy();
    }
    handleInput(event) {
        if (event.code === 'Space') {
            this.scene.switchMode(new DungeonMode(this.scene));
        }
    }
}
//# sourceMappingURL=TitleMode.js.map
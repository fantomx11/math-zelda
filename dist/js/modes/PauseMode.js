import { GameMode } from './GameMode.js';
export class PauseMode extends GameMode {
    enter() {
        this.overlay = this.scene.add.rectangle(0, 0, 320, 256, 0x000000, 0.5).setOrigin(0);
        this.text = this.scene.add.bitmapText(160, 128, 'arcade', 'Paused').setOrigin(0.5);
    }
    exit() {
        if (this.text)
            this.text.destroy();
        if (this.overlay)
            this.overlay.destroy();
    }
    handleInput(event) {
        if (event.code === 'Escape') {
            this.scene.popMode();
        }
    }
}
//# sourceMappingURL=PauseMode.js.map
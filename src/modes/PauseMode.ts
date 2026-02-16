import { GameMode } from './GameMode.js';

export class PauseMode extends GameMode {
  private text!: Phaser.GameObjects.BitmapText;
  private overlay!: Phaser.GameObjects.Rectangle;

  enter(): void {
    this.overlay = this.scene.add.rectangle(0, 0, 320, 256, 0x000000, 0.5).setOrigin(0);
    this.text = this.scene.add.bitmapText(160, 128, 'arcade', 'Paused').setOrigin(0.5);
  }

  exit(): void {
    if (this.text) this.text.destroy();
    if (this.overlay) this.overlay.destroy();
  }

  handleInput(event: KeyboardEvent): void {
    if (event.code === 'Escape') {
      this.scene.popMode();
    }
  }
}
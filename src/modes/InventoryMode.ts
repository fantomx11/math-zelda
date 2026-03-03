import { getInventoryPositionFromItem, InventoryScreenItems, isItem, isWeapon } from "../config";
import { ItemType } from "../Enums";
import { gameState } from "../GameState";

interface Cursor {
  x: number;
  y: number;
}


export class InventoryMode {
  cursor: Cursor;

  constructor() {
    this.cursor = getInventoryPositionFromItem(gameState.player.currentWeapon);
  }

  enter(): void { }
  exit(): void { }
  update(): void { }
  handleInput(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowDown":
      case "S":
        if (this.cursor.y < InventoryScreenItems.length - 1)
          this.cursor.y++;
        else
          this.cursor.y = 0;
        break;

      case "ArrowLeft":
      case "A":
        if (this.cursor.x > 0)
          this.cursor.x--;
        else
          this.cursor.x = InventoryScreenItems[this.cursor.y].length - 1;
        break;

      case "ArrowRight":
      case "D":
        if (this.cursor.x < InventoryScreenItems[this.cursor.y].length - 1)
          this.cursor.x++;
        else
          this.cursor.x = 0;
        break;

      case "ArrowUp":
      case "W":
        if (this.cursor.y > 0)
          this.cursor.y--;
        else
          this.cursor.y = InventoryScreenItems.length - 1;
        break;

      case "Space":
        const item = InventoryScreenItems[this.cursor.y][this.cursor.x];

        if (isWeapon(item))
          gameState.player.selectWeapon(item);
        else if (isItem(item))
          gameState.player.selectItem(item);

        break;
    }
  }
}
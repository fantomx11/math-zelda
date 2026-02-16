import { MazeGenerator } from '../maze.js';

export class DungeonManager {
  public maze: MazeGenerator;
  public grid: any[][];
  public roomX: number = 0;
  public roomY: number = 0;

  constructor(size: number) {
    this.maze = new MazeGenerator(size);
    this.grid = this.maze.generate({ x: 0, y: 0 });
  }

  get currentCell() {
    return this.grid[this.roomY][this.roomX];
  }

  switchRoom(dx: number, dy: number): boolean {
    const newX = this.roomX + dx;
    const newY = this.roomY + dy;
    if (newX >= 0 && newX < this.maze.size && newY >= 0 && newY < this.maze.size) {
      this.roomX = newX;
      this.roomY = newY;
      return true;
    }
    return false;
  }
}
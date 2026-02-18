enum GridCellType {
  Normal = 'normal',
  Start = 'start',
  Boss = 'boss',
  Item = 'item'
}

interface GridCell {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
  visited: boolean;
  type: GridCellType;
  cleared?: boolean;
  itemCollected?: boolean;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Generates a random maze layout.
 */
export class MazeGenerator {
  public grid: GridCell[][];

  constructor() {
    this.grid = [];
    this.reset();
  }

  /**
   * Resets the grid to an initial unvisited state.
   */
  reset(size: number = 4): void {
    this.grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({
        north: false, south: false, east: false, west: false,
        visited: false, type: GridCellType.Normal
      }))
    );
  }

  /**
   * Generates a maze starting from a specific position.
   * @param startPos The starting coordinates.
   * @returns The generated grid.
   */
  generate(startPos: Point, size: number = 4): GridCell[][] {
    let deadEnds: Point[] = [];

    // Loop until we find a maze with enough dead ends
    while (deadEnds.length < 2) {
      this.reset(size);
      const { x: sx, y: sy } = startPos;
      this.grid[sy][sx].type = GridCellType.Start;

      this.carve(sx, sy);
      deadEnds = this.getDeadEnds(sx, sy);
    }

    // Shuffle and assign special rooms
    deadEnds.sort(() => Math.random() - 0.5);
    const boss = deadEnds.pop()!;
    const item = deadEnds.pop()!;

    this.grid[boss.y][boss.x].type = GridCellType.Boss;
    this.grid[item.y][item.x].type = GridCellType.Item;

    return this.grid;
  }

  /**
   * Recursive backtracking algorithm to carve paths.
   * @param cx Current X.
   * @param cy Current Y.
   */
  private carve(cx: number, cy: number): void {
    this.grid[cy][cx].visited = true;
    const directions = [
      { x: 0, y: -1, wall: 'north', opp: 'south' },
      { x: 0, y: 1, wall: 'south', opp: 'north' },
      { x: 1, y: 0, wall: 'east', opp: 'west' },
      { x: -1, y: 0, wall: 'west', opp: 'east' }
    ].sort(() => Math.random() - 0.5);

    for (let { x, y, wall, opp } of directions) {
      let nx = cx + x, ny = cy + y;
      if (nx >= 0 && nx < this.grid.length && ny >= 0 && ny < this.grid[nx].length && !this.grid[ny][nx].visited) {
        (this.grid[cy][cx] as any)[wall] = true;
        (this.grid[ny][nx] as any)[opp] = true;
        this.carve(nx, ny);
      }
    }
  }

  /**
   * Identifies dead ends in the maze.
   * @param startX Starting X to exclude.
   * @param startY Starting Y to exclude.
   * @returns Array of dead end coordinates.
   */
  private getDeadEnds(startX: number, startY: number): Point[] {
    const ends: Point[] = [];
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        const r = this.grid[y][x];
        // Count open walls
        const exits = [r.north, r.south, r.east, r.west].filter(v => v).length;

        // A dead end has 1 exit and isn't where we started
        if (exits === 1 && !(x === startX && y === startY)) {
          ends.push({ x, y });
        }
      }
    }
    return ends;
  }
}

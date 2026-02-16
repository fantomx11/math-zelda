/**
 * Generates a random maze layout.
 */
export class MazeGenerator {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.reset();
    }
    /**
     * Resets the grid to an initial unvisited state.
     */
    reset() {
        this.grid = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => ({
            north: false, south: false, east: false, west: false,
            visited: false, type: 'normal'
        })));
    }
    /**
     * Generates a maze starting from a specific position.
     * @param startPos The starting coordinates.
     * @returns The generated grid.
     */
    generate(startPos) {
        let deadEnds = [];
        // Loop until we find a maze with enough dead ends
        while (deadEnds.length < 2) {
            this.reset();
            const { x: sx, y: sy } = startPos;
            this.grid[sy][sx].type = 'start';
            this.carve(sx, sy);
            deadEnds = this.getDeadEnds(sx, sy);
        }
        // Shuffle and assign special rooms
        deadEnds.sort(() => Math.random() - 0.5);
        const boss = deadEnds.pop();
        const item = deadEnds.pop();
        this.grid[boss.y][boss.x].type = 'boss';
        this.grid[item.y][item.x].type = 'item';
        return this.grid;
    }
    /**
     * Recursive backtracking algorithm to carve paths.
     * @param cx Current X.
     * @param cy Current Y.
     */
    carve(cx, cy) {
        this.grid[cy][cx].visited = true;
        const directions = [
            { x: 0, y: -1, wall: 'north', opp: 'south' },
            { x: 0, y: 1, wall: 'south', opp: 'north' },
            { x: 1, y: 0, wall: 'east', opp: 'west' },
            { x: -1, y: 0, wall: 'west', opp: 'east' }
        ].sort(() => Math.random() - 0.5);
        for (let { x, y, wall, opp } of directions) {
            let nx = cx + x, ny = cy + y;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && !this.grid[ny][nx].visited) {
                this.grid[cy][cx][wall] = true;
                this.grid[ny][nx][opp] = true;
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
    getDeadEnds(startX, startY) {
        const ends = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
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
//# sourceMappingURL=maze.js.map